<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PresensiSholat;
use App\Models\SesiSholat;
use App\Models\Siswa;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PresensiSholatController extends Controller
{
    // Buka / ambil sesi hari ini
    public function sesiHariIni(Request $request): JsonResponse
    {
        $sesi = SesiSholat::hariIni();

        if (! $sesi) {
            $sesi = SesiSholat::create([
                'tanggal' => today(),
                'waktu_buka' => now()->format('H:i'),
                'dibuka_oleh' => $request->user()->id,
            ]);
        }

        $jumlahHadir = $sesi->presensi()->count();

        return response()->json([
            'sesi' => $sesi,
            'jumlah_hadir' => $jumlahHadir,
        ]);
    }

    // Catat presensi via scan NIS atau manual
    public function catat(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nis' => ['required_without:siswa_id', 'string'],
            'siswa_id' => ['required_without:nis', 'integer'],
            'metode' => ['required', 'in:scan,manual'],
        ]);

        // Cari siswa dari NIS (hasil scan) atau id (manual)
        $siswa = isset($validated['siswa_id'])
            ? Siswa::find($validated['siswa_id'])
            : Siswa::where('nis', $validated['nis'])->first();

        if (! $siswa) {
            return response()->json(['message' => 'Siswa tidak ditemukan.'], 404);
        }

        // Hanya siswa muslim yang dicatat
        if ($siswa->agama !== 'islam') {
            return response()->json([
                'message' => 'Siswa ini bukan peserta wajib sholat berjamaah.',
            ], 422);
        }

        $sesi = SesiSholat::hariIni();
        if (! $sesi) {
            return response()->json(['message' => 'Sesi hari ini belum dibuka.'], 422);
        }

        // Cek sudah presensi belum
        $sudah = PresensiSholat::where('sesi_sholat_id', $sesi->id)
            ->where('siswa_id', $siswa->id)
            ->exists();

        if ($sudah) {
            return response()->json([
                'message' => "{$siswa->user->name} sudah tercatat hadir.",
                'duplikat' => true,
                'siswa' => ['nama' => $siswa->user->name, 'nis' => $siswa->nis],
            ], 200);
        }

        PresensiSholat::create([
            'sesi_sholat_id' => $sesi->id,
            'siswa_id' => $siswa->id,
            'waktu_scan' => now(),
            'petugas_id' => $request->user()->id,
            'metode' => $validated['metode'],
        ]);

        return response()->json([
            'message' => 'Presensi berhasil dicatat.',
            'siswa' => [
                'nama' => $siswa->user->name,
                'nis' => $siswa->nis,
                'kelas' => $siswa->kelas?->nama_lengkap,
                'foto_url' => $siswa->foto_url,
            ],
            'jumlah_hadir' => $sesi->presensi()->count(),
        ], 201);
    }

    // Daftar hadir sesi hari ini (untuk ditampilkan real-time)
    public function daftarHadirHariIni(): JsonResponse
    {
        $sesi = SesiSholat::hariIni();
        if (! $sesi) {
            return response()->json(['hadir' => [], 'jumlah' => 0]);
        }

        $hadir = $sesi->presensi()
            ->with('siswa.user', 'siswa.kelas')
            ->orderByDesc('waktu_scan')
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'nama' => $p->siswa->user?->name,
                'nis' => $p->siswa->nis,
                'kelas' => $p->siswa->kelas?->nama_lengkap,
                'waktu' => $p->waktu_scan->format('H:i'),
                'metode' => $p->metode,
                'foto_url' => $p->siswa->foto_url,
            ]);

        return response()->json(['hadir' => $hadir, 'jumlah' => $hadir->count()]);
    }

    // Cari siswa untuk input manual
    public function cariSiswa(Request $request): JsonResponse
    {
        $q = $request->query('q', '');

        $siswa = Siswa::with('user', 'kelas')
            ->where('agama', 'islam')
            ->where(function ($query) use ($q) {
                $query->where('nis', 'like', "%{$q}%")
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$q}%"));
            })
            ->limit(10)
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'nis' => $s->nis,
                'nama' => $s->user?->name,
                'kelas' => $s->kelas?->nama_lengkap,
                'foto_url' => $s->foto_url,
            ]);

        return response()->json($siswa);
    }

    // Rekap per periode (dashboard BK)
    public function rekap(Request $request): JsonResponse
    {
        $dari = $request->query('dari', today()->startOfMonth()->format('Y-m-d'));
        $sampai = $request->query('sampai', today()->format('Y-m-d'));

        // Total sesi wajib dalam periode = jumlah sesi yang ada
        $totalSesi = SesiSholat::whereBetween('tanggal', [$dari, $sampai])->count();

        if ($totalSesi === 0) {
            return response()->json(['total_sesi' => 0, 'siswa' => []]);
        }

        // Hitung kehadiran per siswa muslim
        $siswaMuslim = Siswa::with('user', 'kelas')
            ->where('agama', 'islam')
            ->where('status', 'aktif')
            ->get();

        $sesiIds = SesiSholat::whereBetween('tanggal', [$dari, $sampai])->pluck('id');

        $rekap = $siswaMuslim->map(function ($s) use ($sesiIds, $totalSesi) {
            $hadir = PresensiSholat::whereIn('sesi_sholat_id', $sesiIds)
                ->where('siswa_id', $s->id)
                ->count();

            $tidakHadir = $totalSesi - $hadir;
            $persenTidakHadir = $totalSesi > 0 ? round($tidakHadir / $totalSesi * 100) : 0;

            $kategori = 'hijau';
            if ($persenTidakHadir > 40) $kategori = 'merah';
            elseif ($persenTidakHadir > 20) $kategori = 'kuning';

            return [
                'siswa_id' => $s->id,
                'nama' => $s->user?->name,
                'nis' => $s->nis,
                'kelas' => $s->kelas?->nama_lengkap,
                'hadir' => $hadir,
                'tidak_hadir' => $tidakHadir,
                'persen_tidak_hadir' => $persenTidakHadir,
                'kategori' => $kategori,
                'foto_url' => $s->foto_url,
            ];
        })
        ->sortByDesc('persen_tidak_hadir')
        ->values();

        return response()->json([
            'total_sesi' => $totalSesi,
            'periode' => ['dari' => $dari, 'sampai' => $sampai],
            'siswa' => $rekap,
        ]);
    }
}