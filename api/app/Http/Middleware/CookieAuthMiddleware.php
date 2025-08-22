<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;

class CookieAuthMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        try {
            // Get token from cookie
            $token = $request->cookie('access_token');

            if (!$token) {
                return response()->json(['error' => 'Access token not provided'], 401);
            }

            // Set the token for JWTAuth
            JWTAuth::setToken($token);

            // Try to authenticate the user
            $user = JWTAuth::authenticate();

            if (!$user) {
                return response()->json(['error' => 'User not found'], 401);
            }

        } catch (TokenExpiredException $e) {
            // Try to refresh the token using refresh token
            $refreshToken = $request->cookie('refresh_token');

            if (!$refreshToken) {
                return response()->json(['error' => 'Token expired and no refresh token provided'], 401);
            }

            try {
                // Authenticate with refresh token to get user
                $user = JWTAuth::setToken($refreshToken)->authenticate();

                if (!$user) {
                    return response()->json(['error' => 'Invalid refresh token'], 401);
                }

                // Generate new access token
                $newAccessToken = JWTAuth::fromUser($user);

                // Set the new token for this request
                JWTAuth::setToken($newAccessToken);

                // Add the new token to the response
                $response = $next($request);
                return $response->cookie('access_token', $newAccessToken, 15, '/', null, request()->secure(), true, false, 'Strict');

            } catch (JWTException $refreshException) {
                return response()->json(['error' => 'Token refresh failed'], 401);
            }

        } catch (JWTException $e) {
            return response()->json(['error' => 'Token is invalid'], 401);
        }

        return $next($request);
    }
}

// Register in app/Http/Kernel.php:
// protected $routeMiddleware = [
//     // ... other middleware
//     'auth.cookie' => \App\Http\Middleware\CookieAuthMiddleware::class,
// ];
