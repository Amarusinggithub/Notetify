<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Support\Arr;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;



class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $data = $request->validated();

        $user = User::create([
            'first_name' => $data['first_name'],
            'last_name'  => $data['last_name'],
            'email'      => $data['email'],
            'password'   => bcrypt($data['password']),
        ]);

        $token = JWTAuth::fromUser($user);
        $refreshToken = JWTAuth::claims(['token_type' => 'refresh'])->fromUser($user);
        return response()
            ->json(['message' => 'Registration successful'])
            ->cookie('access_token', $token, 15, '/', null, request()->secure(), true, false, 'Strict')
            ->cookie('refresh_token', $refreshToken, 10080, '/', null, request()->secure(), true, false, 'Strict');
    }

    public function login(LoginRequest $request)
    {
        $data = $request->validated();
        $credentials = Arr::only($data, ['email', 'password']);

        if (!$token =Auth::attempt($credentials)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $user = Auth::user();
        $refreshToken = JWTAuth::claims(['token_type' => 'refresh'])->attempt($credentials);

        return response()
            ->json(['message' => 'Login successful',
                    'user' => $user
])
            ->cookie('access_token', $token, 15, '/', null, request()->secure(), true, false, 'Strict')
            ->cookie('refresh_token', $refreshToken, 10080, '/', null, request()->secure(), true, false, 'Strict');
    }

    public function me(Request $request)
    {
try{
            $token = $request->cookie('access_token');
           if(!$token){
            return response()->json(['error'=> 'Token not provided'],401);
           }

           $user=JWTAuth::setToken($token)->authenticate();
           if(!$user){
            return response()->json(['error'=> 'User not found'],401);
           }
            return response()->json(['user' => $user]);

}catch(\Exception $e){
                return response()->json(['error' => 'Token is invalid'], 401);

}
    }

    public function logout(Request $request)
    {
        try {

               $accessToken = $request->cookie('access_token');
            $refreshToken = $request->cookie('refresh_token');

           if ($accessToken) {
                try {
                    JWTAuth::setToken($accessToken)->invalidate();
                } catch (\Exception $e) {
                }
            }

            // Invalidate refresh token if present
            if ($refreshToken) {
                try {
                    JWTAuth::setToken($refreshToken)->invalidate();
                } catch (\Exception $e) {
                    // Token might already be invalid
                }
            }

return response()
                ->json(['message' => 'Logged out successfully'])
                ->cookie('access_token', '', -1, '/', null, request()->secure(), true, false, 'Strict')
                ->cookie('refresh_token', '', -1, '/', null, request()->secure(), true, false, 'Strict');
        } catch (\Exception $e) {
            return response()->json(['error' => 'Logout failed'], 500);
        }
    }

    public function refresh(Request $request)
    {
        try {
                        $refreshToken = $request->cookie('refresh_token');
if(!$refreshToken){
                return response()->json(['error' => 'Refresh token not provided'], 401);
}

            $user = JWTAuth::setToken($refreshToken)->authenticate();


             if (!$user) {
                return response()->json(['error' => 'Invalid refresh token'], 401);
            }

                        $newAccessToken = JWTAuth::fromUser($user);


            return response()
                ->json([
                    'message' => 'Token refreshed',
                    'user' => $user
                ])
                ->cookie('access_token', $newAccessToken, 15, '/', null, false, true, false, 'Strict');
        } catch (\Exception $e) {
            return response()->json(['error' => 'Refresh failed'], 401);
        }
    }
}
