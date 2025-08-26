<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Events\Registered;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Support\Str;
use App\Http\Controllers\Controller;


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
Auth::login($user);

return response()->json([
            'message' => 'Registration successful!',
            'user' => $user->only(['id', 'first_name', 'last_name', 'email']),
        ], 201);

    }

    public function login(LoginRequest $request)
    {
        $data = $request->validated();
        $credentials = Arr::only($data, ['email', 'password']);
if (Auth::attempt($credentials)) {
    //  prevent session fixation attacks
            $request->session()->regenerate();

        // User authenticated successfully
        $user = Auth::user();

            return response()->json([
                'message' => 'Login successful!',
                'user' => $user->only(['id', 'first_name', 'last_name', 'email']),
            ]);
        } else {
            return response()->json([
                'message' => 'Invalid login credentials!',
            ], 401);
        }
    }

    public function me(Request $request)
    {
  return response()->json([
            'user' => $request->user()->only(['id', 'first_name', 'last_name', 'email']),
        ]);
    }

    public function logout(Request $request)
    {

 Auth::logout();

        // Invalidate the session
        $request->session()->invalidate();

        // Regenerate the CSRF token
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logged out successfully!',
        ]);

}



public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        // Send password reset link
        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status == Password::RESET_LINK_SENT) {
            return response()->json([
                'message' => 'Password reset link sent to your email!',
            ]);
        }

        return response()->json([
            'message' => 'Unable to send password reset link.',
            'error' => __($status),
        ], 400);
    }

    public function showResetForm(Request $request, $token = null)
    {
        return response()->json([
            'token' => $token,
            'email' => $request->email,
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Reset the password
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user) use ($request) {
                $user->forceFill([
                    'password' => Hash::make($request->password),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        if ($status == Password::PASSWORD_RESET) {
            return response()->json([
                'message' => 'Password has been reset successfully!',
            ]);
        }

        return response()->json([
            'message' => 'Unable to reset password.',
            'error' => __($status),
        ], 400);
    }

      public function verifyEmailNotice(Request $request)
    {
        return $request->user()->hasVerifiedEmail()
            ? response()->json(['message' => 'Email already verified.'])
            : response()->json(['message' => 'Please verify your email address.']);
    }

    public function verifyEmail(EmailVerificationRequest $request)
    {
        $request->fulfill();

        return response()->json([
            'message' => 'Email verified successfully!',
        ]);
    }

    public function resendVerificationEmail(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email already verified.',
            ]);
        }

        $request->user()->sendEmailVerificationNotification();

        return response()->json([
            'message' => 'Verification link sent!',
        ]);
    }
}
