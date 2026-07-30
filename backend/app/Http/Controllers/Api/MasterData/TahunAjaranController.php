<?php

namespace App\Http\Controllers\Api\MasterData;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTahunAjaranRequest;
use App\Http\Requests\UpdateTahunAjaranRequest;
use App\Http\Resources\TahunAjaranResource;
use App\Models\TahunAjaran;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class TahunAjaranController extends Controller
{
    public function index(): JsonResponse
    {
        $data = TahunAjaran::orderByDesc('tanggal_mulai')->get();

        return TahunAjaranResource::collection($data)->response();
    }

    public function store(StoreTahunAjaranRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $tahunAjaran = DB::transaction(function () use ($validated) {
            // Kalau di-set aktif, nonaktifkan semua yang lain dulu
            if (! empty($validated['is_active'])) {
                TahunAjaran::where('is_active', true)->update(['is_active' => false]);
            }

            return TahunAjaran::create($validated);
        });

        return (new TahunAjaranResource($tahunAjaran))
            ->response()
            ->setStatusCode(201);
    }

    public function show(TahunAjaran $tahunAjaran): JsonResponse
    {
        return (new TahunAjaranResource($tahunAjaran))->response();
    }

    public function update(UpdateTahunAjaranRequest $request, TahunAjaran $tahunAjaran): JsonResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $tahunAjaran) {
            if (! empty($validated['is_active'])) {
                // Nonaktifkan yang lain (kecuali diri sendiri)
                TahunAjaran::where('is_active', true)
                    ->where('id', '!=', $tahunAjaran->id)
                    ->update(['is_active' => false]);
            }

            $tahunAjaran->update($validated);
        });

        return (new TahunAjaranResource($tahunAjaran))->response();
    }

    public function destroy(TahunAjaran $tahunAjaran): JsonResponse
    {
        // Cegah hapus tahun ajaran aktif
        if ($tahunAjaran->is_active) {
            return response()->json([
                'message' => 'Tahun ajaran yang aktif tidak bisa dihapus.',
            ], 422);
        }

        // Cegah hapus kalau sudah punya kelas
        if ($tahunAjaran->kelas()->exists()) {
            return response()->json([
                'message' => 'Tahun ajaran tidak bisa dihapus karena sudah memiliki kelas.',
            ], 422);
        }

        $tahunAjaran->delete();

        return response()->json(['message' => 'Tahun ajaran berhasil dihapus.']);
    }

    // Endpoint khusus: set satu tahun ajaran jadi aktif
    public function setActive(TahunAjaran $tahunAjaran): JsonResponse
    {
        DB::transaction(function () use ($tahunAjaran) {
            TahunAjaran::where('is_active', true)->update(['is_active' => false]);
            $tahunAjaran->update(['is_active' => true]);
        });

        return (new TahunAjaranResource($tahunAjaran->fresh()))->response();
    }
}