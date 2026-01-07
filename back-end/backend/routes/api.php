<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// Student Authentication Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// Test route to verify API is working
Route::get('/test', function () {
    return response()->json([
        'message' => 'UniConnect API is working! 🚀',
        'status' => 'success',
        'timestamp' => now()
    ]);
});