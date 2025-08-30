<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\NotebookController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register'])
             ->name('register');

    Route::post('login', [AuthController::class, 'login'])
             ->name('login');

    Route::post('forgot-password', [AuthController::class, 'forgotPassword'])
         ->name('password.email');
    Route::get('reset-password/{token}', [AuthController::class, 'showResetForm'])
         ->name('password.reset');
    Route::post('reset-password', [AuthController::class, 'resetPassword'])
         ->name('password.store');

    Route::middleware(['auth:sanctum'])->group(function () {
        Route::get('verify-email', [AuthController::class, 'verifyEmailNotice'])
             ->name('verification.notice');
        Route::get('verify-email/{id}/{hash}', [AuthController::class, 'verifyEmail'])
             ->middleware(['signed', 'throttle:6,1'])
             ->name('verification.verify');
        Route::post('email/verification-notification', [AuthController::class, 'resendVerificationEmail'])
             ->middleware('throttle:6,1')
             ->name('verification.send');
    });

    Route::middleware(['auth:sanctum'])->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);
    });
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::resource('notes', NoteController::class)->except(['show']);
    Route::resource('notebooks', NotebookController::class)->except(['show']);
    Route::resource('tags', TagController::class)->except(['show']);
});
