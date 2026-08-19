<?php

namespace App\Http\Controllers\Api\MasterData;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSiswaRequest;
use App\Http\Requests\UpdateSiswaRequest;
use App\Http\Resources\SiswaResource;
use App\Models\Siswa;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

use App\Imports\SiswaImport;
use Maatwebsite\Excel\Facades\Excel;

class SiswaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Siswa::query()->with(['user', 'jurusan', 'kelas']);

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nis', 'like', "%{$search}%")
                  ->orWhere('nisn', 'like', "%{$search}%")
                  ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%"));
            });
        }

        if ($kelasId = $request->query('kelas_id')) {
            $query->where('kelas_id', $kelasId);
        }

        if ($jurusanId = $request->query('jurusan_id')) {
            $query->where('jurusan_id', $jurusanId);
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $siswa = $query->orderBy('nis')->paginate(20);

        return SiswaResource::collection($siswa)->response();
    }

    public function store(StoreSiswaRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Simpan foto dulu (kalau ada), ambil path-nya
        $fotoPath = null;
        if ($request->hasFile('foto')) {
            $fotoPath = $request->file('foto')->store('siswa/foto', 'public');
        }

        $siswa = DB::transaction(function () use ($data, $fotoPath) {
            // Email default: NIS + domain, kalau tidak diisi
            $email = $data['email'] ?? $data['nis'] . '@siswa.smkn9malang.sch.id';

            // Password default: tanggal lahir format ddmmyyyy
            $defaultPassword = date('dmY', strtotime($data['tanggal_lahir']));

            // 1. Buat akun user
            $user = User::create([
                'name' => $data['nama'],
                'email' => $email,
                'password' => Hash::make($defaultPassword),
            ]);
            $user->assignRole('siswa');

            // 2. Buat record siswa terhubung ke user
            return Siswa::create([
                'user_id' => $user->id,
                'nis' => $data['nis'],
                'nisn' => $data['nisn'] ?? null,
                'jurusan_id' => $data['jurusan_id'],
                'kelas_id' => $data['kelas_id'] ?? null,
                'jenis_kelamin' => $data['jenis_kelamin'],
                'tempat_lahir' => $data['tempat_lahir'],
                'tanggal_lahir' => $data['tanggal_lahir'],
                'agama' => $data['agama'],
                'alamat' => $data['alamat'],
                'no_hp' => $data['no_hp'] ?? null,
                'angkatan' => $data['angkatan'],
                'status' => 'aktif',
                'foto_path' => $fotoPath,
            ]);
        });

        $siswa->load(['user', 'jurusan', 'kelas']);

        return (new SiswaResource($siswa))->response()->setStatusCode(201);
    }

    public function show(Siswa $siswa): JsonResponse
    {
        $siswa->load(['user', 'jurusan', 'kelas']);

        return (new SiswaResource($siswa))->response();
    }

    public function update(UpdateSiswaRequest $request, Siswa $siswa): JsonResponse
    {
        $data = $request->validated();

        // Simpan foto baru (kalau ada), hapus foto lama
        $fotoPath = $siswa->foto_path; // pertahankan foto lama kalau tidak ganti
        if ($request->hasFile('foto')) {
            if ($siswa->foto_path) {
                Storage::disk('public')->delete($siswa->foto_path);
            }
            $fotoPath = $request->file('foto')->store('siswa/foto', 'public');
        }

        DB::transaction(function () use ($data, $siswa, $fotoPath) {
            // 1. Update akun user
            $siswa->user->update([
                'name' => $data['nama'],
                'email' => $data['email'] ?? $siswa->user->email,
            ]);

            // 2. Update record siswa
            $siswa->update([
                'nis' => $data['nis'],
                'nisn' => $data['nisn'] ?? null,
                'jurusan_id' => $data['jurusan_id'],
                'kelas_id' => $data['kelas_id'] ?? null,
                'jenis_kelamin' => $data['jenis_kelamin'],
                'tempat_lahir' => $data['tempat_lahir'],
                'tanggal_lahir' => $data['tanggal_lahir'],
                'agama' => $data['agama'],
                'alamat' => $data['alamat'],
                'no_hp' => $data['no_hp'] ?? null,
                'angkatan' => $data['angkatan'],
                'foto_path' => $fotoPath,
            ]);
        });

        $siswa->load(['user', 'jurusan', 'kelas']);

        return (new SiswaResource($siswa))->response();
    }

    public function updateFoto(Request $request, Siswa $siswa): JsonResponse
    {
        $request->validate([
            'foto' => ['required', 'image', 'mimes:jpeg,jpg,png', 'max:2048'],
        ]);

        // Hapus foto lama
        if ($siswa->foto_path) {
            Storage::disk('public')->delete($siswa->foto_path);
        }

        $siswa->foto_path = $request->file('foto')->store('siswa/foto', 'public');
        $siswa->save();

        return response()->json([
            'message' => 'Foto siswa berhasil diperbarui.',
            'foto_url' => $siswa->foto_url,
        ]);
    }

    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls', 'max:10240'], // maks 10MB
        ]);

        $import = new SiswaImport();

        try {
            Excel::import($import, $request->file('file'));
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Gagal memproses file: ' . $e->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' => 'Import selesai.',
            'ringkasan' => [
                'berhasil' => count($import->berhasil),
                'gagal' => count($import->gagal),
                'dilewati' => count($import->dilewati),
            ],
            'detail' => [
                'berhasil' => $import->berhasil,
                'gagal' => $import->gagal,
                'dilewati' => $import->dilewati,
            ],
        ]);
    }

    public function destroy(Siswa $siswa): JsonResponse
    {
        DB::transaction(function () use ($siswa) {
            $user = $siswa->user;
            $siswa->delete();
            // Hapus akun user juga
            $user?->delete();
        });

        return response()->json(['message' => 'Data siswa berhasil dihapus.']);
    }
}