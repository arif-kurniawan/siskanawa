<?php

namespace App\Http\Controllers\Api\MasterData;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreWaliMuridRequest;
use App\Http\Requests\UpdateWaliMuridRequest;
use App\Http\Resources\WaliMuridResource;
use App\Models\User;
use App\Models\WaliMurid;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class WaliMuridController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = WaliMurid::query()->with('user')->withCount('siswa');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nik', 'like', "%{$search}%")
                    ->orWhere('no_hp', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%"));
            });
        }

        $data = $query->orderByDesc('id')->paginate(20);

        return WaliMuridResource::collection($data)->response();
    }

    public function store(StoreWaliMuridRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $wali = DB::transaction(function () use ($validated) {
            // Buat akun user + password default
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'] ?? $this->emailDefault($validated),
                'password' => Hash::make($validated['no_hp']), // password awal = no HP
            ]);
            $user->assignRole('wali_murid');

            // Buat profil wali murid
            $wali = WaliMurid::create([
                'user_id' => $user->id,
                'nik' => $validated['nik'] ?? null,
                'pekerjaan' => $validated['pekerjaan'] ?? null,
                'no_hp' => $validated['no_hp'],
                'alamat' => $validated['alamat'],
            ]);

            // Hubungkan anak-anak (kalau ada)
            if (! empty($validated['anak'])) {
                $this->sinkronAnak($wali, $validated['anak']);
            }

            return $wali;
        });

        $wali->load('user', 'siswa.user', 'siswa.kelas');

        return (new WaliMuridResource($wali))->response()->setStatusCode(201);
    }

    public function show(WaliMurid $waliMurid): JsonResponse
    {
        $waliMurid->load('user', 'siswa.user', 'siswa.kelas.jurusan')->loadCount('siswa');

        return (new WaliMuridResource($waliMurid))->response();
    }

    public function update(UpdateWaliMuridRequest $request, WaliMurid $waliMurid): JsonResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $waliMurid) {
            // Update data user
            $waliMurid->user->update([
                'name' => $validated['name'],
                'email' => $validated['email'] ?? $waliMurid->user->email,
            ]);

            // Update profil wali
            $waliMurid->update([
                'nik' => $validated['nik'] ?? null,
                'pekerjaan' => $validated['pekerjaan'] ?? null,
                'no_hp' => $validated['no_hp'],
                'alamat' => $validated['alamat'],
            ]);
        });

        $waliMurid->load('user', 'siswa.user', 'siswa.kelas');

        return (new WaliMuridResource($waliMurid))->response();
    }

    public function destroy(WaliMurid $waliMurid): JsonResponse
    {
        DB::transaction(function () use ($waliMurid) {
            $user = $waliMurid->user;
            // Hapus profil (pivot ikut cascade), lalu user
            $waliMurid->siswa()->detach();
            $waliMurid->delete();
            $user?->delete();
        });

        return response()->json(['message' => 'Wali murid berhasil dihapus.']);
    }

    // ===== Helper =====

    private function emailDefault(array $data): string
    {
        // Kalau tidak ada email, buat placeholder unik dari nama + random
        $slug = Str::slug($data['name'], '.');
        return "{$slug}." . Str::random(4) . "@wali.smkn9-malang.sch.id";
    }

    // Sinkron daftar anak ke pivot (dipakai store & kelola hubungan)
    private function sinkronAnak(WaliMurid $wali, array $anak): void
    {
        $syncData = [];
        foreach ($anak as $a) {
            $syncData[$a['siswa_id']] = [
                'hubungan' => $a['hubungan'],
                'is_primary' => $a['is_primary'] ?? false,
            ];
        }
        $wali->siswa()->syncWithoutDetaching($syncData);
    }

    // Tambah/hubungkan satu anak ke wali
    public function tambahAnak(Request $request, WaliMurid $waliMurid): JsonResponse
    {
        $validated = $request->validate([
            'siswa_id' => ['required', 'exists:siswa,id'],
            'hubungan' => ['required', 'in:ayah,ibu,wali'],
            'is_primary' => ['boolean'],
        ]);

        // Cegah duplikat
        if ($waliMurid->siswa()->where('siswa.id', $validated['siswa_id'])->exists()) {
            return response()->json(['message' => 'Siswa ini sudah terhubung dengan wali tersebut.'], 422);
        }

        $waliMurid->siswa()->attach($validated['siswa_id'], [
            'hubungan' => $validated['hubungan'],
            'is_primary' => $validated['is_primary'] ?? false,
        ]);

        $waliMurid->load('siswa.user', 'siswa.kelas');

        return (new WaliMuridResource($waliMurid))->response();
    }

    // Lepaskan anak dari wali
    public function lepasAnak(WaliMurid $waliMurid, int $siswaId): JsonResponse
    {
        $waliMurid->siswa()->detach($siswaId);

        return response()->json(['message' => 'Hubungan dengan siswa berhasil dilepas.']);
    }
}