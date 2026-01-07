<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// Student Authentication Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);

// Test route to verify API is working
Route::get('/test', function () {
    return response()->json([
        'message' => 'UniConnect API is working!',
        'status' => 'success',
        'timestamp' => now()->toDateTimeString()
    ]);
});

// Database check route for teacher
Route::get('/database-check', function () {
    try {
        $users = \App\Models\User::all();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Database connection successful',
            'database' => 'uniconnect_db',
            'total_users' => $users->count(),
            'users' => $users
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Database error',
            'error' => $e->getMessage()
        ], 500);
    }
});