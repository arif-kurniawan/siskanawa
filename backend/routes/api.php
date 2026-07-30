<?php

use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\MasterData\JurusanController;
use App\Http\Controllers\Api\MasterData\TahunAjaranController;
use Illuminate\Support\Facades\Route;

// Route publik — tidak butuh autentikasi, tapi tetap dapat session dari statefulApi
Route::post('/login', [LoginController::class, 'login']);

// Route terproteksi — butuh session/token aktif
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [LoginController::class, 'logout']);
    Route::get('/me', [LoginController::class, 'me']);

    // Master Data — Jurusan
    Route::apiResource('jurusan', JurusanController::class);
    Route::apiResource('tahun-ajaran', TahunAjaranController::class);
    Route::patch('tahun-ajaran/{tahunAjaran}/set-active', [TahunAjaranController::class, 'setActive']);
});