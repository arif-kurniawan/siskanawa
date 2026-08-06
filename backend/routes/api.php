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
use App\Http\Controllers\Api\PresensiSholatController;
use App\Http\Controllers\Api\KasusPembinaanController;
use App\Http\Controllers\Api\DeteksiDiniController;
use App\Http\Controllers\Api\Tatib\JenisPelanggaranController;
use App\Http\Controllers\Api\Tatib\TatibOptionController;
use App\Http\Controllers\Api\Tatib\CatatanPelanggaranController;
use App\Http\Controllers\Api\Tatib\RekapPoinController;
use App\Http\Controllers\Api\PortalOrtu\BukuPenghubungController;
use App\Http\Controllers\Api\MasterData\WaliMuridController;
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
    
    Route::prefix('presensi-sholat')->group(function () {
        Route::get('sesi-hari-ini', [PresensiSholatController::class, 'sesiHariIni']);
        Route::post('catat', [PresensiSholatController::class, 'catat']);
        Route::get('daftar-hadir', [PresensiSholatController::class, 'daftarHadirHariIni']);
        Route::get('cari-siswa', [PresensiSholatController::class, 'cariSiswa']);
        Route::get('rekap', [PresensiSholatController::class, 'rekap']);
    });
    

    Route::get('penugasan', [PenugasanMengajarController::class, 'index']);
    Route::post('penugasan', [PenugasanMengajarController::class, 'store']);
    Route::delete('penugasan/{penugasanMengajar}', [PenugasanMengajarController::class, 'destroy']);

    Route::prefix('pembinaan')->group(function () {
        Route::get('/', [KasusPembinaanController::class, 'index']);
        Route::post('/', [KasusPembinaanController::class, 'store']);
        Route::get('{kasusPembinaan}', [KasusPembinaanController::class, 'show']);
        Route::post('{kasusPembinaan}/tindak-lanjut', [KasusPembinaanController::class, 'tambahTindakLanjut']);
        Route::post('{kasusPembinaan}/eskalasi', [KasusPembinaanController::class, 'eskalasi']);
    });

    Route::prefix('deteksi-dini')->group(function () {
        Route::get('kehadiran', [DeteksiDiniController::class, 'index']);
        Route::post('generate-draft', [DeteksiDiniController::class, 'generateDraft']);
    });

    // Modul Tatib
    Route::prefix('tatib')->group(function () {
        // Options & pengaturan (harus SEBELUM apiResource)
        Route::get('options/pasal', [TatibOptionController::class, 'pasal']);
        Route::get('options/jenis', [TatibOptionController::class, 'jenis']);
        Route::patch('jenis/{jenisTatib}/poin', [TatibOptionController::class, 'updateJenisPoin']);
        Route::get('sanksi', [TatibOptionController::class, 'sanksi']);

        // CRUD jenis pelanggaran
        Route::apiResource('jenis-pelanggaran', JenisPelanggaranController::class);

        // Pencatatan pelanggaran
        Route::get('catatan', [CatatanPelanggaranController::class, 'index']);
        Route::post('catatan', [CatatanPelanggaranController::class, 'store']);
        Route::post('catatan/penghapusan-poin', [CatatanPelanggaranController::class, 'penghapusanPoin']);
        Route::delete('catatan/{catatanPelanggaran}', [CatatanPelanggaranController::class, 'destroy']);

        // Rekap poin (route spesifik SEBELUM {siswa})
        Route::get('rekap-poin', [RekapPoinController::class, 'index']);
        Route::get('rekap-poin/{siswa}', [RekapPoinController::class, 'show']);
    });

    // Portal Ortu — hanya untuk wali murid
    Route::prefix('portal-ortu')->middleware('role:wali_murid')->group(function () {
        Route::get('anak-saya', [BukuPenghubungController::class, 'anakSaya']);
        Route::get('buku-penghubung/{siswaId}', [BukuPenghubungController::class, 'bukuPenghubung']);
        Route::post('buku-penghubung/balas/{tindakLanjutId}', [BukuPenghubungController::class, 'balas']);
    });

    Route::prefix('wali-murid')->group(function () {
        // Kelola hubungan anak (SEBELUM apiResource)
        Route::post('{waliMurid}/anak', [WaliMuridController::class, 'tambahAnak']);
        Route::delete('{waliMurid}/anak/{siswaId}', [WaliMuridController::class, 'lepasAnak']);
    });

    Route::apiResource('wali-murid', WaliMuridController::class)
        ->parameters(['wali-murid' => 'waliMurid']);
});