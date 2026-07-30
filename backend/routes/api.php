<?php

use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\MasterData\JurusanController;
use App\Http\Controllers\Api\MasterData\TahunAjaranController;
use App\Http\Controllers\Api\MasterData\KelasController;
use App\Http\Controllers\Api\OptionController;
use App\Http\Controllers\Api\MasterData\SiswaController;
use Illuminate\Support\Facades\Route;

// Route publik — tidak butuh autentikasi, tapi tetap dapat session dari statefulApi
Route::post('/login', [LoginController::class, 'login']);

// Route terproteksi — butuh session/token aktif
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [LoginController::class, 'logout']);
    Route::get('/me', [LoginController::class, 'me']);

    // Master Data
    Route::apiResource('jurusan', JurusanController::class);
    Route::apiResource('tahun-ajaran', TahunAjaranController::class);
    Route::apiResource('kelas', KelasController::class)->parameters(['kelas' => 'kelas']);
    Route::patch('tahun-ajaran/{tahunAjaran}/set-active', [TahunAjaranController::class, 'setActive']);
    Route::apiResource('siswa', SiswaController::class);

    // Options untuk dropdown
    Route::get('options/jurusan', [OptionController::class, 'jurusan']);
    Route::get('options/tahun-ajaran', [OptionController::class, 'tahunAjaran']);
    Route::get('options/guru', [OptionController::class, 'guru']);
    Route::get('options/kelas', [OptionController::class, 'kelas']);
});