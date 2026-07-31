<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Jurusan;
use App\Models\TahunAjaran;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class OptionController extends Controller
{
    public function jurusan(): JsonResponse
    {
        $data = \App\Models\Jurusan::where('is_active', true)
            ->orderBy('kode')->get(['id', 'kode', 'nama']);
        return response()->json($data);
    }

    public function tahunAjaran(): JsonResponse
    {
        $data = \App\Models\TahunAjaran::orderByDesc('tanggal_mulai')->get(['id', 'nama', 'semester', 'is_active']);
        return response()->json($data);
    }
    
    public function guru(): JsonResponse
    {
        $data = \App\Models\User::whereHas('roles', function ($q) {
            $q->whereIn('name', ['guru_mapel', 'wali_kelas', 'guru_bk']);
        })->orderBy('name')->get(['id', 'name']);
        return response()->json($data);
    }

    public function mataPelajaran(): JsonResponse
    {
        $data = \App\Models\MataPelajaran::orderBy('nama')->get(['id', 'kode', 'nama']);
        return response()->json($data);
    }
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