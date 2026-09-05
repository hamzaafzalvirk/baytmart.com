<?php

use App\Http\Controllers\Api\AdminProductController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminStoreController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\StorefrontController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'app' => config('app.name'),
    ]);
});

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);
Route::get('/categories', [ProductController::class, 'categories']);
Route::get('/storefront/content', [StorefrontController::class, 'content']);
Route::post('/orders', [StorefrontController::class, 'order']);
Route::post('/admin/login', [AuthController::class, 'login']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/products/import', [AdminProductController::class, 'import']);
    Route::apiResource('products', AdminProductController::class)->except(['show']);
    Route::get('/categories', [AdminStoreController::class, 'categories']);
    Route::post('/categories', [AdminStoreController::class, 'saveCategory']);
    Route::delete('/categories/{category}', [AdminStoreController::class, 'deleteCategory']);
    Route::get('/menu', [AdminStoreController::class, 'menu']);
    Route::post('/menu', [AdminStoreController::class, 'saveMenu']);
    Route::delete('/menu/{menu}', [AdminStoreController::class, 'deleteMenu']);
});
