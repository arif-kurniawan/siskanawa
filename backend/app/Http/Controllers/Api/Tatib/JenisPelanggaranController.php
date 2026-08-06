<?php

namespace App\Http\Controllers\Api\Tatib;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreJenisPelanggaranRequest;
use App\Http\Requests\UpdateJenisPelanggaranRequest;
use App\Http\Resources\JenisPelanggaranResource;
use App\Models\JenisPelanggaran;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JenisPelanggaranController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = JenisPelanggaran::query()->with(['pasal', 'jenis']);

        // Filter per pasal
        if ($pasalId = $request->query('pasal_id')) {
            $query->where('pasal_tatib_id', $pasalId);
        }

        // Filter per jenis
        if ($jenisId = $request->query('jenis_id')) {
            $query->where('jenis_tatib_id', $jenisId);
        }

        // Pencarian
        if ($search = $request->query('search')) {
            $query->where('nama', 'like', "%{$search}%");
        }

        $data = $query->orderBy('pasal_tatib_id')->orderBy('jenis_tatib_id')->get();

        return JenisPelanggaranResource::collection($data)->response();
    }

    public function store(StoreJenisPelanggaranRequest $request): JsonResponse
    {
        $item = JenisPelanggaran::create($request->validated());
        $item->load(['pasal', 'jenis']);

        return (new JenisPelanggaranResource($item))->response()->setStatusCode(201);
    }

    public function show(JenisPelanggaran $jenisPelanggaran): JsonResponse
    {
        $jenisPelanggaran->load(['pasal', 'jenis']);

        return (new JenisPelanggaranResource($jenisPelanggaran))->response();
    }

    public function update(UpdateJenisPelanggaranRequest $request, JenisPelanggaran $jenisPelanggaran): JsonResponse
    {
        $jenisPelanggaran->update($request->validated());
        $jenisPelanggaran->load(['pasal', 'jenis']);

        return (new JenisPelanggaranResource($jenisPelanggaran))->response();
    }

    public function destroy(JenisPelanggaran $jenisPelanggaran): JsonResponse
    {
        $jenisPelanggaran->delete();

        return response()->json(['message' => 'Jenis pelanggaran berhasil dihapus.']);
    }
}