<?php

namespace App\Http\Controllers\Api\MasterData;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGuruRequest;
use App\Http\Requests\UpdateGuruRequest;
use App\Http\Resources\GuruResource;
use App\Models\Guru;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class GuruController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Guru::query()->with('user');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nip', 'like', "%{$search}%")
                  ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%"));
            });
        }

        $guru = $query->orderBy('id')->paginate(20);

        return GuruResource::collection($guru)->response();
    }

    public function store(StoreGuruRequest $request): JsonResponse
    {
        $data = $request->validated();

        $guru = DB::transaction(function () use ($data) {
            // Email default
            $email = $data['email']
                ?? ($data['nip']
                    ? $data['nip'] . '@guru.smkn9-malang.sch.id'
                    : Str::slug($data['nama'], '') . '@guru.smkn9-malang.sch.id');

            // Password default
            $defaultPassword = $data['nip'] ?: 'guru12345';

            $user = User::create([
                'name' => $data['nama'],
                'email' => $email,
                'password' => Hash::make($defaultPassword),
            ]);
            $user->assignRole('guru_mapel');

            return Guru::create([
                'user_id' => $user->id,
                'nip' => $data['nip'] ?? null,
                'nuptk' => $data['nuptk'] ?? null,
                'jenis_kelamin' => $data['jenis_kelamin'],
                'tanggal_lahir' => $data['tanggal_lahir'] ?? null,
                'no_hp' => $data['no_hp'] ?? null,
                'alamat' => $data['alamat'] ?? null,
                'status_kepegawaian' => $data['status_kepegawaian'] ?? null,
            ]);
        });

        $guru->load('user');

        return (new GuruResource($guru))->response()->setStatusCode(201);
    }

    public function show(Guru $guru): JsonResponse
    {
        $guru->load('user');
        return (new GuruResource($guru))->response();
    }

    public function update(UpdateGuruRequest $request, Guru $guru): JsonResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data, $guru) {
            $guru->user->update([
                'name' => $data['nama'],
                'email' => $data['email'] ?? $guru->user->email,
            ]);

            $guru->update([
                'nip' => $data['nip'] ?? null,
                'nuptk' => $data['nuptk'] ?? null,
                'jenis_kelamin' => $data['jenis_kelamin'],
                'tanggal_lahir' => $data['tanggal_lahir'] ?? null,
                'no_hp' => $data['no_hp'] ?? null,
                'alamat' => $data['alamat'] ?? null,
                'status_kepegawaian' => $data['status_kepegawaian'] ?? null,
            ]);
        });

        $guru->load('user');

        return (new GuruResource($guru))->response();
    }

    public function destroy(Guru $guru): JsonResponse
    {
        // Cegah hapus kalau guru ini jadi wali kelas
        if ($guru->user->kelasWali()->exists()) {
            return response()->json([
                'message' => 'Guru ini masih menjadi wali kelas. Lepas dari kelas terlebih dahulu.',
            ], 422);
        }

        DB::transaction(function () use ($guru) {
            $user = $guru->user;
            $guru->delete();
            $user?->delete();
        });

        return response()->json(['message' => 'Data guru berhasil dihapus.']);
    }
}