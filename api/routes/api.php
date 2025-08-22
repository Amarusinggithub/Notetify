<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\NotebookController;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('me', [AuthController::class, 'me']);
    Route::post('refresh', [AuthController::class, 'refresh']);
});

// Protected routes using the cookie middleware
Route::middleware('auth.cookie')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

      Route::resource('notes', NoteController::class)->except(['show']);


    Route::resource('notebooks', NotebookController::class)->except(['show']);


    Route::resource('tags', TagController::class)->except(['show']);


});
