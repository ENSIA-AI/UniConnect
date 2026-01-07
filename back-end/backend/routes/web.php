<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});
// API Routes for demo
Route::prefix('api')->group(function () {
    // Test endpoint
    Route::get('/test', function () {
        return response()->json([
            'message' => 'UniConnect API is working!',
            'status' => 'success',
            'database' => 'Connected',
            'timestamp' => now()->toDateTimeString()
        ]);
    });
    
    // Register endpoint
    Route::post('/register', [App\Http\Controllers\AuthController::class, 'register']);
    
    // Database check
    Route::get('/check', function () {
        $users = \App\Models\User::all();
        return response()->json([
            'system' => 'Operational',
            'database' => 'uniconnect_db',
            'total_students' => $users->count(),
            'students' => $users
        ]);
    });
});