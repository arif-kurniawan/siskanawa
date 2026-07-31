<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PenugasanMengajar;
use App\Models\TahunAjaran;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PenugasanMengajarController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = PenugasanMengajar::query()
            ->with(['guru', 'mataPelajaran', 'kelas.jurusan', 'tahunAjaran']);

        // Filter per guru
        if ($guruId = $request->query('guru_id')) {
            $query->where('guru_id', $guruId);
        }

        // Default: tahun ajaran aktif
        $taId = $request->query('tahun_ajaran_id');
        if (! $taId) {
            $taAktif = TahunAjaran::where('is_active', true)->first();
            $taId = $taAktif?->id;
        }
        if ($taId) {
            $query->where('tahun_ajaran_id', $taId);
        }

        $data = $query->get()->map(fn ($p) => [
            'id' => $p->id,
            'guru' => ['id' => $p->guru->id, 'name' => $p->guru->name],
            'mata_pelajaran' => ['id' => $p->mataPelajaran->id, 'nama' => $p->mataPelajaran->nama],
            'kelas' => ['id' => $p->kelas->id, 'nama_lengkap' => $p->kelas->nama_lengkap],
            'tahun_ajaran' => ['id' => $p->tahunAjaran->id, 'nama' => $p->tahunAjaran->nama],
        ]);

        return response()->json($data);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'guru_id' => ['required', 'exists:users,id'],
            'mata_pelajaran_id' => ['required', 'exists:mata_pelajaran,id'],
            'kelas_id' => ['required', 'exists:kelas,id'],
            'tahun_ajaran_id' => ['required', 'exists:tahun_ajaran,id'],
        ]);

        // Cek duplikat
        $exists = PenugasanMengajar::where($validated)->exists();
        if ($exists) {
            return response()->json([
                'message' => 'Penugasan ini sudah ada.',
            ], 422);
        }

        $penugasan = PenugasanMengajar::create($validated);

        return response()->json($penugasan, 201);
    }

    public function destroy(PenugasanMengajar $penugasanMengajar): JsonResponse
    {
        $penugasanMengajar->delete();
        return response()->json(['message' => 'Penugasan berhasil dihapus.']);
    }

    public function milikSaya(Request $request): JsonResponse
    {
        $taAktif = TahunAjaran::where('is_active', true)->first();

        $data = PenugasanMengajar::with(['mataPelajaran', 'kelas.jurusan'])
            ->where('guru_id', $request->user()->id)
            ->where('tahun_ajaran_id', $taAktif?->id)
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'mata_pelajaran' => ['id' => $p->mataPelajaran->id, 'nama' => $p->mataPelajaran->nama],
                'kelas' => ['id' => $p->kelas->id, 'nama_lengkap' => $p->kelas->nama_lengkap],
            ]);

        return response()->json($data);
    }
}