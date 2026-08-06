<?php

namespace App\Http\Controllers\Api\Tatib;

use App\Http\Controllers\Controller;
use App\Models\CatatanPelanggaran;
use App\Models\Siswa;
use App\Models\TahunAjaran;
use App\Services\SanksiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class RekapPoinController extends Controller
{
    private function semesterDefault(): string
    {
        return now()->month >= 7 ? 'ganjil' : 'genap';
    }

    // Rekap semua siswa (bisa filter kelas)
    public function index(Request $request): JsonResponse
    {
        $ta = TahunAjaran::where('is_active', true)->firstOrFail();
        $semester = $request->query('semester', $this->semesterDefault());

        // Jumlahkan poin per siswa dalam satu query
        $poinPerSiswa = CatatanPelanggaran::query()
            ->where('tahun_ajaran_id', $ta->id)
            ->where('semester', $semester)
            ->selectRaw('siswa_id, SUM(poin) as total_poin')
            ->groupBy('siswa_id')
            ->pluck('total_poin', 'siswa_id');

        // Ambil siswa (filter kelas opsional)
        $siswaQuery = Siswa::query()->with('kelas');
        if ($kelasId = $request->query('kelas_id')) {
            $siswaQuery->where('kelas_id', $kelasId);
        }
        // Hanya siswa yang punya poin (kecuali diminta semua)
        if (!$request->boolean('semua')) {
            $siswaQuery->whereIn('id', $poinPerSiswa->keys());
        }
        $siswaList = $siswaQuery->get();

        $hasil = $siswaList->map(function ($siswa) use ($poinPerSiswa) {
            $total = (int) ($poinPerSiswa[$siswa->id] ?? 0);
            $sanksi = SanksiService::untukPoin($total);

            return [
                'siswa_id' => $siswa->id,
                'nama' => $siswa->nama,
                'nis' => $siswa->nis,
                'kelas' => $siswa->kelas?->nama_lengkap ?? '-',
                'total_poin' => $total,
                'status_sanksi' => $sanksi?->nama,
                'level_sanksi' => $sanksi?->level,
            ];
        })
        ->sortByDesc('total_poin')
        ->values();

        return response()->json([
            'tahun_ajaran' => $ta->nama ?? $ta->tahun,
            'semester' => $semester,
            'data' => $hasil,
        ]);
    }

    // Detail satu siswa: total poin, status, riwayat
    public function show(Request $request, Siswa $siswa): JsonResponse
    {
        $ta = TahunAjaran::where('is_active', true)->firstOrFail();
        $semester = $request->query('semester', $this->semesterDefault());

        $riwayat = CatatanPelanggaran::with(['jenisPelanggaran', 'pencatat'])
            ->where('siswa_id', $siswa->id)
            ->where('tahun_ajaran_id', $ta->id)
            ->where('semester', $semester)
            ->orderByDesc('tanggal')
            ->get();

        $total = (int) $riwayat->sum('poin');
        $sanksi = SanksiService::untukPoin($total);

        return response()->json([
            'siswa' => [
                'id' => $siswa->id,
                'nama' => $siswa->nama,
                'nis' => $siswa->nis,
                'kelas' => $siswa->kelas?->nama_lengkap ?? '-',
            ],
            'tahun_ajaran' => $ta->nama ?? $ta->tahun,
            'semester' => $semester,
            'total_poin' => $total,
            'status_sanksi' => $sanksi?->nama,
            'tindakan_sanksi' => $sanksi?->tindakan,
            'riwayat' => $riwayat->map(fn ($c) => [
                'id' => $c->id,
                'tanggal' => $c->tanggal?->format('Y-m-d'),
                'tipe' => $c->tipe,
                'pelanggaran' => $c->jenisPelanggaran?->nama ?? ($c->tipe === 'penghapusan' ? 'Penghapusan poin' : '-'),
                'poin' => $c->poin,
                'keterangan' => $c->keterangan,
                'pencatat' => $c->pencatat?->name,
            ]),
        ]);
    }
}