<?php

namespace App\Http\Controllers\Api\MasterData;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreJurusanRequest;
use App\Http\Requests\UpdateJurusanRequest;
use App\Http\Resources\JurusanResource;
use App\Models\Jurusan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JurusanController extends Controller
{
    // GET /api/jurusan — daftar semua jurusan
    public function index(Request $request): JsonResponse
    {
        $query = Jurusan::query()
            ->with('kaprodi')
            ->withCount('siswa');

        // Pencarian sederhana
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('kode', 'like', "%{$search}%");
            });
        }

        $jurusan = $query->orderBy('kode')->get();

        return JurusanResource::collection($jurusan)->response();
    }

    // POST /api/jurusan — tambah jurusan baru
    public function store(StoreJurusanRequest $request): JsonResponse
    {
        $jurusan = Jurusan::create($request->validated());

        return (new JurusanResource($jurusan))
            ->response()
            ->setStatusCode(201);
    }

    // GET /api/jurusan/{jurusan} — detail satu jurusan
    public function show(Jurusan $jurusan): JsonResponse
    {
        $jurusan->load('kaprodi')->loadCount('siswa');

        return (new JurusanResource($jurusan))->response();
    }

    // PUT /api/jurusan/{jurusan} — update jurusan
    public function update(UpdateJurusanRequest $request, Jurusan $jurusan): JsonResponse
    {
        $jurusan->update($request->validated());

        return (new JurusanResource($jurusan))->response();
    }

    // DELETE /api/jurusan/{jurusan} — hapus jurusan
    public function destroy(Jurusan $jurusan): JsonResponse
    {
        // Cegah hapus kalau masih ada siswa terkait
        if ($jurusan->siswa()->exists()) {
            return response()->json([
                'message' => 'Jurusan tidak bisa dihapus karena masih memiliki siswa.',
            ], 422);
        }

        $jurusan->delete();

        return response()->json(['message' => 'Jurusan berhasil dihapus.']);
    }
}