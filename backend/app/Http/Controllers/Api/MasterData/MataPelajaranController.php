<?php

namespace App\Http\Controllers\Api\MasterData;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMataPelajaranRequest;
use App\Http\Requests\UpdateMataPelajaranRequest;
use App\Http\Resources\MataPelajaranResource;
use App\Models\MataPelajaran;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MataPelajaranController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = MataPelajaran::query()->with('jurusan');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('kode', 'like', "%{$search}%");
            });
        }

        if ($kategori = $request->query('kategori')) {
            $query->where('kategori', $kategori);
        }

        $data = $query->orderBy('kategori')->orderBy('nama')->get();

        return MataPelajaranResource::collection($data)->response();
    }

    public function store(StoreMataPelajaranRequest $request): JsonResponse
    {
        $mapel = MataPelajaran::create($request->validated());
        $mapel->load('jurusan');

        return (new MataPelajaranResource($mapel))->response()->setStatusCode(201);
    }

    public function show(MataPelajaran $mataPelajaran): JsonResponse
    {
        $mataPelajaran->load('jurusan');
        return (new MataPelajaranResource($mataPelajaran))->response();
    }

    public function update(UpdateMataPelajaranRequest $request, MataPelajaran $mataPelajaran): JsonResponse
    {
        $mataPelajaran->update($request->validated());
        $mataPelajaran->load('jurusan');

        return (new MataPelajaranResource($mataPelajaran))->response();
    }

    public function destroy(MataPelajaran $mataPelajaran): JsonResponse
    {
        $mataPelajaran->delete();
        return response()->json(['message' => 'Mata pelajaran berhasil dihapus.']);
    }
}