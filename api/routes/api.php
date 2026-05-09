<?php

use App\Http\Controllers\NoteController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\NotebookController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;




Route::middleware(['auth:sanctum'])->group(function () {
    Route::resource('notes', NoteController::class);
    Route::resource('notebooks', NotebookController::class)->except(['show']);
    Route::resource('tags', TagController::class)->except(['show']);
});


Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
