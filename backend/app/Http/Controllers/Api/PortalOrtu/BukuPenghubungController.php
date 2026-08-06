<?php

namespace App\Http\Controllers\Api\PortalOrtu;

use App\Http\Controllers\Controller;
use App\Models\KasusPembinaan;
use App\Models\ResponsOrtu;
use App\Models\TindakLanjutKasus;
use App\Models\WaliMurid;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BukuPenghubungController extends Controller
{
    // Ambil profil wali murid dari user yang login
    private function waliMurid(Request $request): ?WaliMurid
    {
        return WaliMurid::where('user_id', $request->user()->id)->first();
    }

    // ID siswa yang jadi anak/wali dari user ini
    private function siswaIds(WaliMurid $wali): array
    {
        return $wali->siswa()->pluck('siswa.id')->toArray();
    }

    // Daftar anak + ringkasan komunikasi
    public function anakSaya(Request $request): JsonResponse
    {
        $wali = $this->waliMurid($request);
        if (! $wali) {
            return response()->json(['message' => 'Data wali murid tidak ditemukan.'], 403);
        }

        $anak = $wali->siswa()->with('kelas.jurusan')->get()->map(function ($s) {
            // Hitung catatan untuk ortu yang belum dibalas
            $belumDibalas = TindakLanjutKasus::where('ditujukan_ke_ortu', true)
                ->whereHas('kasus', fn ($q) => $q->where('siswa_id', $s->id)->where('is_rahasia', false))
                ->whereDoesntHave('responsOrtu')
                ->count();

            return [
                'siswa_id' => $s->id,
                'nama' => $s->user?->name ?? $s->nama,
                'nis' => $s->nis,
                'kelas' => $s->kelas?->nama_lengkap ?? '-',
                'hubungan' => $s->pivot->hubungan,
                'perlu_perhatian' => $belumDibalas,
            ];
        });

        return response()->json(['anak' => $anak]);
    }

    // Buku penghubung untuk satu anak: daftar catatan ditujukan_ke_ortu + respons
    public function bukuPenghubung(Request $request, int $siswaId): JsonResponse
    {
        $wali = $this->waliMurid($request);
        if (! $wali) {
            return response()->json(['message' => 'Data wali murid tidak ditemukan.'], 403);
        }

        // Pastikan siswa ini benar-benar anak dari wali ini
        if (! in_array($siswaId, $this->siswaIds($wali))) {
            return response()->json(['message' => 'Anda tidak berhak mengakses data siswa ini.'], 403);
        }

        // Ambil catatan yang ditujukan ke ortu, dari kasus NON-rahasia anak ini
        $catatan = TindakLanjutKasus::with(['user', 'responsOrtu.waliMurid.user', 'kasus'])
            ->where('ditujukan_ke_ortu', true)
            ->whereHas('kasus', fn ($q) => $q->where('siswa_id', $siswaId)->where('is_rahasia', false))
            ->orderBy('created_at')
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'isi' => $t->isi,
                'dari' => $t->user?->name ?? 'Sekolah',
                'tanggal' => $t->created_at?->format('Y-m-d H:i'),
                'kasus_judul' => $t->kasus?->judul,
                'respons' => $t->responsOrtu->map(fn ($r) => [
                    'id' => $r->id,
                    'isi' => $r->isi,
                    'dari' => $r->waliMurid?->user?->name ?? 'Orang tua',
                    'tanggal' => $r->created_at?->format('Y-m-d H:i'),
                ]),
            ]);

        return response()->json(['catatan' => $catatan]);
    }

    // Ortu membalas sebuah catatan
    public function balas(Request $request, int $tindakLanjutId): JsonResponse
    {
        $wali = $this->waliMurid($request);
        if (! $wali) {
            return response()->json(['message' => 'Data wali murid tidak ditemukan.'], 403);
        }

        $validated = $request->validate([
            'isi' => ['required', 'string', 'max:2000'],
        ]);

        // Muat catatan + kasus, pastikan memang untuk ortu & untuk anak wali ini & non-rahasia
        $tindakLanjut = TindakLanjutKasus::with('kasus')->find($tindakLanjutId);

        if (! $tindakLanjut
            || ! $tindakLanjut->ditujukan_ke_ortu
            || $tindakLanjut->kasus->is_rahasia
            || ! in_array($tindakLanjut->kasus->siswa_id, $this->siswaIds($wali))
        ) {
            return response()->json(['message' => 'Catatan tidak ditemukan atau bukan hak Anda.'], 403);
        }

        $respons = ResponsOrtu::create([
            'tindak_lanjut_id' => $tindakLanjutId,
            'wali_murid_id' => $wali->id,
            'isi' => $validated['isi'],
        ]);

        $respons->load('waliMurid.user');

        return response()->json([
            'message' => 'Balasan terkirim.',
            'respons' => [
                'id' => $respons->id,
                'isi' => $respons->isi,
                'dari' => $respons->waliMurid?->user?->name ?? 'Orang tua',
                'tanggal' => $respons->created_at?->format('Y-m-d H:i'),
            ],
        ], 201);
    }
}