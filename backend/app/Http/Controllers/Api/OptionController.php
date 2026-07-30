<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Jurusan;
use App\Models\TahunAjaran;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class OptionController extends Controller
{
    // Daftar jurusan untuk dropdown
    public function jurusan(): JsonResponse
    {
        $data = Jurusan::where('is_active', true)
            ->orderBy('kode')
            ->get(['id', 'kode', 'nama']);

        return response()->json($data);
    }

    // Daftar tahun ajaran untuk dropdown
    public function tahunAjaran(): JsonResponse
    {
        $data = TahunAjaran::orderByDesc('tanggal_mulai')
            ->get(['id', 'nama', 'semester', 'is_active']);

        return response()->json($data);
    }

    // Daftar guru untuk dropdown wali kelas
    public function guru(): JsonResponse
    {
        $data = User::whereHas('roles', function ($q) {
            $q->whereIn('name', ['guru_mapel', 'wali_kelas', 'guru_bk']);
        })
        ->orderBy('name')
        ->get(['id', 'name']);

        return response()->json($data);
    }

    // Daftar kelas untuk dropdown (hanya yang tahun ajaran aktif)
    public function kelas(): JsonResponse
    {
        $data = \App\Models\Kelas::with('jurusan', 'tahunAjaran')
            ->whereHas('tahunAjaran', fn ($q) => $q->where('is_active', true))
            ->get()
            ->map(fn ($k) => [
                'id' => $k->id,
                'nama_lengkap' => $k->nama_lengkap,
            ]);

        return response()->json($data);
    }
}