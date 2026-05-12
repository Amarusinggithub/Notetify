<?php

use App\Http\Controllers\NoteController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\NotebookController;
use App\Http\Controllers\CollabController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;




Route::middleware(['auth:sanctum','verified'])->group(function () {
    Route::get('notes/stream', [NoteController::class, 'stream']);
    Route::resource('notes', NoteController::class);
    Route::resource('notebooks', NotebookController::class)->except(['show']);
    Route::resource('tags', TagController::class)->except(['show']);
});


Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('collab/token/{note}',        [CollabController::class, 'token']);
    Route::post('collab/token/{note}/viewer', [CollabController::class, 'viewerToken']);
});

// routes/api.php — outside auth:sanctum
Route::middleware('collab.webhook')->group(function () {
    Route::get('collab/notes/{note}',  [CollabController::class, 'load']);
    Route::put('collab/notes/{note}', [CollabController::class, 'store']);
});
