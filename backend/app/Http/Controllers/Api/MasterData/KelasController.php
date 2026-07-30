<?php

namespace App\Http\Controllers\Api\MasterData;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreKelasRequest;
use App\Http\Requests\UpdateKelasRequest;
use App\Http\Resources\KelasResource;
use App\Models\Kelas;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KelasController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Kelas::query()
            ->with(['jurusan', 'tahunAjaran', 'waliKelas'])
            ->withCount('siswa');

        // Filter opsional per tahun ajaran
        if ($taId = $request->query('tahun_ajaran_id')) {
            $query->where('tahun_ajaran_id', $taId);
        }

        // Filter opsional per jurusan
        if ($jurusanId = $request->query('jurusan_id')) {
            $query->where('jurusan_id', $jurusanId);
        }

        $kelas = $query->orderBy('tingkat')->orderBy('nama_rombel')->get();

        return KelasResource::collection($kelas)->response();
    }

    public function store(StoreKelasRequest $request): JsonResponse
    {
        $kelas = Kelas::create($request->validated());
        $kelas->load(['jurusan', 'tahunAjaran', 'waliKelas']);

        return (new KelasResource($kelas))->response()->setStatusCode(201);
    }

    public function show(Kelas $kelas): JsonResponse
    {
        $kelas->load(['jurusan', 'tahunAjaran', 'waliKelas'])->loadCount('siswa');

        return (new KelasResource($kelas))->response();
    }

    public function update(UpdateKelasRequest $request, Kelas $kelas): JsonResponse
    {
        $kelas->update($request->validated());
        $kelas->load(['jurusan', 'tahunAjaran', 'waliKelas']);

        return (new KelasResource($kelas))->response();
    }

    public function destroy(Kelas $kelas): JsonResponse
    {
        if ($kelas->siswa()->exists()) {
            return response()->json([
                'message' => 'Kelas tidak bisa dihapus karena masih memiliki siswa.',
            ], 422);
        }

        $kelas->delete();

        return response()->json(['message' => 'Kelas berhasil dihapus.']);
    }
}