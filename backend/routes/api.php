<?php

use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\MasterData\JurusanController;
use App\Http\Controllers\Api\MasterData\TahunAjaranController;
use App\Http\Controllers\Api\MasterData\KelasController;
use App\Http\Controllers\Api\OptionController;
use App\Http\Controllers\Api\MasterData\SiswaController;
use App\Http\Controllers\Api\MasterData\GuruController;
use App\Http\Controllers\Api\MasterData\TendikController;
use App\Http\Controllers\Api\MasterData\MataPelajaranController;
use App\Http\Controllers\Api\PenugasanMengajarController;
use App\Http\Controllers\Api\JurnalMengajarController;
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
    Route::apiResource('guru', GuruController::class);
    Route::apiResource('tendik', TendikController::class);
    Route::apiResource('mata-pelajaran', MataPelajaranController::class)->parameters(['mata-pelajaran' => 'mataPelajaran']);
    Route::apiResource('jurnal', JurnalMengajarController::class)->parameters(['jurnal' => 'jurnalMengajar']);

    // Options untuk dropdown
    Route::get('options/jurusan', [OptionController::class, 'jurusan']);
    Route::get('options/tahun-ajaran', [OptionController::class, 'tahunAjaran']);
    Route::get('options/guru', [OptionController::class, 'guru']);
    Route::get('options/kelas', [OptionController::class, 'kelas']);
    Route::get('options/mata-pelajaran', [OptionController::class, 'mataPelajaran']);
    Route::get('options/siswa-by-kelas/{kelasId}', [OptionController::class, 'siswaByKelas']);
    Route::get('penugasan/milik-saya', [PenugasanMengajarController::class, 'milikSaya']);
    

    Route::get('penugasan', [PenugasanMengajarController::class, 'index']);
    Route::post('penugasan', [PenugasanMengajarController::class, 'store']);
    Route::delete('penugasan/{penugasanMengajar}', [PenugasanMengajarController::class, 'destroy']);
});