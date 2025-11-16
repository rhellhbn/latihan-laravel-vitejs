<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\TodoController;
use Illuminate\Support\Facades\Route;

Route::middleware(['handle.inertia'])->group(function () {
    
    // Auth Routes (Untuk yang belum login)
    Route::group(['prefix' => 'auth'], function () {
        Route::get('/login', [AuthController::class, 'login'])->name('auth.login');
        Route::post('/login/post', [AuthController::class, 'postLogin'])->name('auth.login.post');

        Route::get('/register', [AuthController::class, 'register'])->name('auth.register');
        Route::post('/register/post', [AuthController::class, 'postRegister'])->name('auth.register.post');

        Route::get('/logout', [AuthController::class, 'logout'])->name('auth.logout');
    });

    // Protected Routes (Harus login dulu)
    Route::group(['middleware' => 'check.auth'], function () {
        // Home
        Route::get('/', [HomeController::class, 'home'])->name('home');
        
        // Todos Routes - PINDAHKAN KE SINI agar terlindungi
        Route::get('/todos', [TodoController::class, 'index'])->name('todos.index');
        Route::post('/todos', [TodoController::class, 'store'])->name('todos.store');
        Route::put('/todos/{todo}', [TodoController::class, 'update'])->name('todos.update');
        Route::post('/todos/{todo}/cover', [TodoController::class, 'updateCover'])->name('todos.update-cover');
        Route::delete('/todos/{todo}', [TodoController::class, 'destroy'])->name('todos.destroy');
    });
    
});