<?php

namespace App\Http\Controllers\Api\Tatib;

use App\Http\Controllers\Controller;
use App\Models\PasalTatib;
use App\Models\JenisTatib;
use App\Models\PengaturanSanksi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TatibOptionController extends Controller
{
    // Daftar pasal untuk dropdown
    public function pasal(): JsonResponse
    {
        $data = PasalTatib::orderBy('urutan')->get(['id', 'kode', 'nama']);
        return response()->json($data);
    }

    // Daftar jenis untuk dropdown (termasuk poin)
    public function jenis(): JsonResponse
    {
        $data = JenisTatib::orderBy('urutan')->get(['id', 'kode', 'nama', 'poin']);
        return response()->json($data);
    }

    // Update poin sebuah jenis — INI YANG BIKIN POIN EDITABLE
    public function updateJenisPoin(Request $request, JenisTatib $jenisTatib): JsonResponse
    {
        $validated = $request->validate([
            'poin' => ['required', 'integer', 'min:0', 'max:1000'],
        ]);

        $jenisTatib->update($validated);

        return response()->json([
            'message' => "Poin {$jenisTatib->nama} berhasil diubah menjadi {$jenisTatib->poin}.",
            'data' => $jenisTatib->only(['id', 'kode', 'nama', 'poin']),
        ]);
    }

    // Daftar pengaturan sanksi
    public function sanksi(): JsonResponse
    {
        $data = PengaturanSanksi::orderBy('level')->get();
        return response()->json($data);
    }
}