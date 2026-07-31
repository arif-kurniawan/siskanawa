<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JurnalMengajar;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class JurnalMengajarController extends Controller
{
    // Daftar jurnal (guru lihat miliknya, admin lihat semua)
    public function index(Request $request): JsonResponse
    {
        $query = JurnalMengajar::query()
            ->with(['kelas.jurusan', 'mataPelajaran', 'guru'])
            ->withCount('presensi');

        // Guru biasa hanya lihat jurnal sendiri
        $user = $request->user();
        if ($user->hasRole('guru_mapel') && ! $user->hasRole('kepala_sekolah')) {
            $query->where('guru_id', $user->id);
        }

        if ($tanggal = $request->query('tanggal')) {
            $query->where('tanggal', $tanggal);
        }
        if ($kelasId = $request->query('kelas_id')) {
            $query->where('kelas_id', $kelasId);
        }

        $jurnal = $query->orderByDesc('tanggal')->orderBy('jam_ke')->paginate(20);

        return response()->json($jurnal);
    }

    // Simpan jurnal + presensi sekaligus
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'kelas_id' => ['required', 'exists:kelas,id'],
            'mata_pelajaran_id' => ['required', 'exists:mata_pelajaran,id'],
            'tanggal' => ['required', 'date'],
            'jam_ke' => ['required', 'integer', 'min:1', 'max:12'],
            'materi' => ['required', 'string'],
            'catatan' => ['nullable', 'string'],
            'presensi' => ['required', 'array', 'min:1'],
            'presensi.*.siswa_id' => ['required', 'exists:siswa,id'],
            'presensi.*.status' => ['required', 'in:hadir,izin,sakit,alpa,dispensasi'],
            'presensi.*.keterangan' => ['nullable', 'string'],
        ]);

        // Cek duplikat jurnal (kelas + tanggal + jam)
        $exists = JurnalMengajar::where('kelas_id', $validated['kelas_id'])
            ->where('tanggal', $validated['tanggal'])
            ->where('jam_ke', $validated['jam_ke'])
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Jurnal untuk kelas, tanggal, dan jam ini sudah ada.',
            ], 422);
        }

        $jurnal = DB::transaction(function () use ($validated, $request) {
            // 1. Buat jurnal
            $jurnal = JurnalMengajar::create([
                'kelas_id' => $validated['kelas_id'],
                'mata_pelajaran_id' => $validated['mata_pelajaran_id'],
                'guru_id' => $request->user()->id,
                'tanggal' => $validated['tanggal'],
                'jam_ke' => $validated['jam_ke'],
                'materi' => $validated['materi'],
                'catatan' => $validated['catatan'] ?? null,
            ]);

            // 2. Buat semua baris presensi
            $rows = collect($validated['presensi'])->map(fn ($p) => [
                'jurnal_mengajar_id' => $jurnal->id,
                'siswa_id' => $p['siswa_id'],
                'status' => $p['status'],
                'keterangan' => $p['keterangan'] ?? null,
                'created_at' => now(),
                'updated_at' => now(),
            ])->all();

            DB::table('presensi_siswa')->insert($rows);

            return $jurnal;
        });

        $jurnal->load(['kelas', 'mataPelajaran', 'presensi.siswa.user']);

        return response()->json($jurnal->append('rekap'), 201);
    }

    // Detail jurnal + presensinya
    public function show(JurnalMengajar $jurnalMengajar): JsonResponse
    {
        $jurnalMengajar->load([
            'kelas.jurusan', 'mataPelajaran', 'guru',
            'presensi.siswa.user',
        ]);

        return response()->json($jurnalMengajar->append('rekap'));
    }

    // Update jurnal + presensi
    public function update(Request $request, JurnalMengajar $jurnalMengajar): JsonResponse
    {
        $validated = $request->validate([
            'materi' => ['required', 'string'],
            'catatan' => ['nullable', 'string'],
            'presensi' => ['required', 'array', 'min:1'],
            'presensi.*.siswa_id' => ['required', 'exists:siswa,id'],
            'presensi.*.status' => ['required', 'in:hadir,izin,sakit,alpa,dispensasi'],
            'presensi.*.keterangan' => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($validated, $jurnalMengajar) {
            $jurnalMengajar->update([
                'materi' => $validated['materi'],
                'catatan' => $validated['catatan'] ?? null,
            ]);

            // Hapus presensi lama, buat ulang (paling simpel & konsisten)
            $jurnalMengajar->presensi()->delete();

            $rows = collect($validated['presensi'])->map(fn ($p) => [
                'jurnal_mengajar_id' => $jurnalMengajar->id,
                'siswa_id' => $p['siswa_id'],
                'status' => $p['status'],
                'keterangan' => $p['keterangan'] ?? null,
                'created_at' => now(),
                'updated_at' => now(),
            ])->all();

            DB::table('presensi_siswa')->insert($rows);
        });

        return response()->json(['message' => 'Jurnal berhasil diperbarui.']);
    }

    public function destroy(JurnalMengajar $jurnalMengajar): JsonResponse
    {
        // Presensi ikut terhapus otomatis (cascadeOnDelete)
        $jurnalMengajar->delete();

        return response()->json(['message' => 'Jurnal berhasil dihapus.']);
    }
}