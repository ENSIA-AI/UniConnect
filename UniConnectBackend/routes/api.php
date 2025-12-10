<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LostFoundItemController;

/**
 * Public API Routes for Lost and Found Items
 * These routes don't require authentication
 */
Route::prefix('items')->group(function () {
    // GET: Get all lost items
    // URL: GET /api/items/lost
    Route::get('/lost', [LostFoundItemController::class, 'indexLost']);
    
    // GET: Get all found items
    // URL: GET /api/items/found
    Route::get('/found', [LostFoundItemController::class, 'indexFound']);
    
    // GET: Search items by keyword
    // URL: GET /api/items/search?keyword=phone&type=lost
    Route::get('/search', [LostFoundItemController::class, 'search']);
    
    // GET: Get single item by ID
    // URL: GET /api/items/1
    Route::get('/{id}', [LostFoundItemController::class, 'show']);
    
    // POST: Report a lost item
    // URL: POST /api/items/lost
    Route::post('/lost', [LostFoundItemController::class, 'storeLost']);
    
    // POST: Report a found item
    // URL: POST /api/items/found
    Route::post('/found', [LostFoundItemController::class, 'storeFound']);
    
    // PUT: Update an item
    // URL: PUT /api/items/1
    Route::put('/{id}', [LostFoundItemController::class, 'update']);
    
    // DELETE: Delete an item
    // URL: DELETE /api/items/1
    Route::delete('/{id}', [LostFoundItemController::class, 'destroy']);
    
    // PATCH: Update item status
    // URL: PATCH /api/items/1/status
    Route::patch('/{id}/status', [LostFoundItemController::class, 'updateStatus']);
});

/**
 * Example of protected routes (if you add authentication later)
 * Uncomment when you implement authentication
 */
/*
Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('items')->group(function () {
        // Protected routes that require authentication
        Route::post('/lost', [LostFoundItemController::class, 'storeLost']);
        Route::post('/found', [LostFoundItemController::class, 'storeFound']);
        Route::put('/{id}', [LostFoundItemController::class, 'update']);
        Route::delete('/{id}', [LostFoundItemController::class, 'destroy']);
    });
});
*/