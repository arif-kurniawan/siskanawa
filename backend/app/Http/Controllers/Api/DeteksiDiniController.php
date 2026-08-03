<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KasusPembinaan;
use App\Models\Siswa;
use App\Models\TahunAjaran;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DeteksiDiniController extends Controller
{
    // Ambang default (bisa disesuaikan)
    private const AMBANG_KUNING = 15; // % ketidakhadiran
    private const AMBANG_MERAH = 30;

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Periode: default 30 hari terakhir
        $hari = (int) $request->query('hari', 30);
        $dari = now()->subDays($hari)->format('Y-m-d');
        $sampai = now()->format('Y-m-d');

        // Batasi ke kelas wali kalau user wali kelas (bukan BK/kepsek)
        $kelasFilter = null;
        if ($user->hasRole('wali_kelas') && ! $user->hasAnyRole(['guru_bk', 'kepala_sekolah'])) {
            $kelasFilter = $user->kelasWali()->pluck('id')->toArray();
        }

        // Ambil siswa (opsional filter kelas dari query)
        $kelasId = $request->query('kelas_id');

        $query = Siswa::with('user', 'kelas')
            ->where('status', 'aktif');

        if ($kelasFilter !== null) {
            $query->whereIn('kelas_id', $kelasFilter);
        }
        if ($kelasId) {
            $query->where('kelas_id', $kelasId);
        }

        $siswaList = $query->get();

        // Hitung indikator per siswa
        $hasil = $siswaList->map(function ($siswa) use ($dari, $sampai) {
            // Total pertemuan siswa ini dalam periode (baris presensi yang ada)
            $presensi = DB::table('presensi_siswa')
                ->join('jurnal_mengajar', 'presensi_siswa.jurnal_mengajar_id', '=', 'jurnal_mengajar.id')
                ->where('presensi_siswa.siswa_id', $siswa->id)
                ->whereBetween('jurnal_mengajar.tanggal', [$dari, $sampai])
                ->select('presensi_siswa.status', DB::raw('count(*) as jumlah'))
                ->groupBy('presensi_siswa.status')
                ->pluck('jumlah', 'status')
                ->toArray();

            $totalPertemuan = array_sum($presensi);
            $hadir = ($presensi['hadir'] ?? 0) + ($presensi['dispensasi'] ?? 0); // dispensasi dihitung hadir
            $alpa = $presensi['alpa'] ?? 0;
            $izin = $presensi['izin'] ?? 0;
            $sakit = $presensi['sakit'] ?? 0;

            // Ketidakhadiran = tidak hadir tanpa keterangan (alpa) + separuh bobot izin/sakit?
            // Untuk sederhana & tegas: pakai alpa sebagai basis utama, plus persentase tidak hadir total.
            $tidakHadir = $totalPertemuan - $hadir;
            $persenTidakHadir = $totalPertemuan > 0 ? round($tidakHadir / $totalPertemuan * 100) : 0;

            // Kategori berdasarkan persentase ketidakhadiran
            $kategori = 'hijau';
            if ($persenTidakHadir >= self::AMBANG_MERAH) $kategori = 'merah';
            elseif ($persenTidakHadir >= self::AMBANG_KUNING) $kategori = 'kuning';

            return [
                'siswa_id' => $siswa->id,
                'nama' => $siswa->user?->name,
                'nis' => $siswa->nis,
                'kelas' => $siswa->kelas?->nama_lengkap,
                'kelas_id' => $siswa->kelas_id,
                'total_pertemuan' => $totalPertemuan,
                'hadir' => $hadir,
                'alpa' => $alpa,
                'izin' => $izin,
                'sakit' => $sakit,
                'tidak_hadir' => $tidakHadir,
                'persen_tidak_hadir' => $persenTidakHadir,
                'kategori' => $kategori,
            ];
        })
        // Hanya tampilkan yang punya data (pernah dipresensi) & bukan hijau sempurna
        ->filter(fn ($s) => $s['total_pertemuan'] > 0)
        ->sortByDesc('persen_tidak_hadir')
        ->values();

        // Ringkasan
        $ringkasan = [
            'merah' => $hasil->where('kategori', 'merah')->count(),
            'kuning' => $hasil->where('kategori', 'kuning')->count(),
            'hijau' => $hasil->where('kategori', 'hijau')->count(),
            'total' => $hasil->count(),
        ];

        return response()->json([
            'periode' => ['dari' => $dari, 'sampai' => $sampai, 'hari' => $hari],
            'ambang' => ['kuning' => self::AMBANG_KUNING, 'merah' => self::AMBANG_MERAH],
            'ringkasan' => $ringkasan,
            'siswa' => $hasil,
        ]);
    }

    // Generate draft kasus untuk siswa merah (dipicu tombol admin/BK)
    public function generateDraft(Request $request): JsonResponse
    {
        $user = $request->user();

        // Hanya BK/kepsek yang boleh generate
        if (! $user->hasAnyRole(['guru_bk', 'kepala_sekolah'])) {
            return response()->json(['message' => 'Tidak diizinkan.'], 403);
        }

        $validated = $request->validate([
            'siswa_ids' => ['required', 'array', 'min:1'],
            'siswa_ids.*' => ['exists:siswa,id'],
            'hari' => ['nullable', 'integer'],
        ]);

        $taAktif = TahunAjaran::where('is_active', true)->first();
        $hari = $validated['hari'] ?? 30;

        $dibuat = 0;
        $dilewati = 0;

        DB::transaction(function () use ($validated, $user, $taAktif, $hari, &$dibuat, &$dilewati) {
            foreach ($validated['siswa_ids'] as $siswaId) {
                // Anti-duplikat: cek apakah siswa sudah punya kasus kehadiran yang belum selesai
                $sudahAda = KasusPembinaan::where('siswa_id', $siswaId)
                    ->where('kategori', 'kehadiran')
                    ->where('status', '!=', 'selesai')
                    ->exists();

                if ($sudahAda) {
                    $dilewati++;
                    continue;
                }

                $kasus = KasusPembinaan::create([
                    'siswa_id' => $siswaId,
                    'kategori' => 'kehadiran',
                    'tingkat' => 'sedang',
                    'judul' => 'Terdeteksi: kehadiran rendah',
                    'deskripsi' => "Draft otomatis dari deteksi dini. Persentase ketidakhadiran siswa dalam {$hari} hari terakhir melampaui ambang. Mohon ditinjau dan ditindaklanjuti wali kelas.",
                    'status' => 'baru',
                    'level_penanganan' => 'wali_kelas',
                    'pelapor_id' => $user->id,
                    'tahun_ajaran_id' => $taAktif?->id,
                    'is_rahasia' => false,
                ]);

                // Catat tindak lanjut awal sebagai penanda draft otomatis
                \App\Models\TindakLanjutKasus::create([
                    'kasus_pembinaan_id' => $kasus->id,
                    'user_id' => $user->id,
                    'jenis' => 'catatan',
                    'isi' => 'Kasus dibuat otomatis oleh sistem deteksi dini kehadiran. Perlu ditinjau.',
                ]);

                $dibuat++;
            }
        });

        return response()->json([
            'message' => "Draft kasus dibuat: {$dibuat}. Dilewati (sudah ada kasus aktif): {$dilewati}.",
            'dibuat' => $dibuat,
            'dilewati' => $dilewati,
        ]);
    }
}