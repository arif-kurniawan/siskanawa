<?php

namespace App\Http\Controllers\Api\MasterData;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTendikRequest;
use App\Http\Requests\UpdateTendikRequest;
use App\Http\Resources\TendikResource;
use App\Models\Tendik;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TendikController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Tendik::query()->with('user');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nip', 'like', "%{$search}%")
                  ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%"));
            });
        }

        $tendik = $query->orderBy('id')->paginate(20);

        return TendikResource::collection($tendik)->response();
    }

    public function store(StoreTendikRequest $request): JsonResponse
    {
        $data = $request->validated();

        $tendik = DB::transaction(function () use ($data) {
            // Email default
            $email = $data['email']
                ?? ($data['nip']
                    ? $data['nip'] . '@smkn9malang.sch.id'
                    : Str::slug($data['nama'], '') . '@smkn9malang.sch.id');

            // Password default
            $defaultPassword = $data['nip'] ?: 'tendik12345';

            $user = User::create([
                'name' => $data['nama'],
                'email' => $email,
                'password' => Hash::make($defaultPassword),
            ]);
            $user->assignRole('tendik');

            return Tendik::create([
                'user_id' => $user->id,
                'nip' => $data['nip'] ?? null,
                'jenis_kelamin' => $data['jenis_kelamin'],
                'tanggal_lahir' => $data['tanggal_lahir'] ?? null,
                'unit_kerja' => $data['unit_kerja'] ?? null,
                'jabatan' => $data['jabatan'] ?? null,
                'no_hp' => $data['no_hp'] ?? null,
                'alamat' => $data['alamat'] ?? null,
            ]);
        });

        $tendik->load('user');

        return (new TendikResource($tendik))->response()->setStatusCode(201);
    }

    public function show(Tendik $tendik): JsonResponse
    {
        $tendik->load('user');
        return (new TendikResource($tendik))->response();
    }

    public function update(UpdateTendikRequest $request, Tendik $tendik): JsonResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data, $tendik) {
            $tendik->user->update([
                'name' => $data['nama'],
                'email' => $data['email'] ?? $tendik->user->email,
            ]);

            $tendik->update([
                'nip' => $data['nip'] ?? null,
                'jenis_kelamin' => $data['jenis_kelamin'],
                'tanggal_lahir' => $data['tanggal_lahir'] ?? null,
                'no_hp' => $data['no_hp'] ?? null,
                'alamat' => $data['alamat'] ?? null,
                'unit_kerja' => $data['unit_kerja'] ?? null,
                'jabatan' => $data['jabatan'] ?? null,
            ]);
        });

        $tendik->load('user');

        return (new TendikResource($tendik))->response();
    }

    public function destroy(Tendik $tendik): JsonResponse
    {
        DB::transaction(function () use ($tendik) {
            $user = $tendik->user;
            $tendik->delete();
            $user?->delete();
        });

        return response()->json(['message' => 'Data tendik berhasil dihapus.']);
    }
}