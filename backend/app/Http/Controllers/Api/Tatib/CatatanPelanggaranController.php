<?php

namespace App\Http\Controllers\Api\Tatib;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCatatanPelanggaranRequest;
use App\Http\Requests\StorePenghapusanPoinRequest;
use App\Http\Resources\CatatanPelanggaranResource;
use App\Services\TatibPembinaanService;
use App\Models\CatatanPelanggaran;
use App\Models\JenisPelanggaran;
use App\Models\TahunAjaran;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;


class CatatanPelanggaranController extends Controller
{
    // Tentukan semester dari tanggal (Juli-Des = ganjil, Jan-Jun = genap)
    private function semesterDariTanggal(string $tanggal): string
    {
        $bulan = Carbon::parse($tanggal)->month;
        return $bulan >= 7 ? 'ganjil' : 'genap';
    }

    // Tahun ajaran aktif
    private function tahunAjaranAktif(): TahunAjaran
    {
        return TahunAjaran::where('is_active', true)->firstOrFail();
    }

    public function index(Request $request): JsonResponse
    {
        $query = CatatanPelanggaran::query()
            ->with(['siswa', 'jenisPelanggaran', 'pencatat']);

        if ($siswaId = $request->query('siswa_id')) {
            $query->where('siswa_id', $siswaId);
        }
        if ($tipe = $request->query('tipe')) {
            $query->where('tipe', $tipe);
        }

        // Default: periode aktif
        $ta = $this->tahunAjaranAktif();
        $semester = $request->query('semester', $this->semesterDariTanggal(now()->toDateString()));
        $query->where('tahun_ajaran_id', $ta->id)->where('semester', $semester);

        $data = $query->orderByDesc('tanggal')->orderByDesc('id')->paginate(20);

        return CatatanPelanggaranResource::collection($data)->response();
    }

    public function store(StoreCatatanPelanggaranRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // Ambil poin snapshot dari jenis pelanggaran (via jenis_tatib)
        $jenis = JenisPelanggaran::with('jenis')->findOrFail($validated['jenis_pelanggaran_id']);
        $poin = $jenis->poin; // accessor: ikut jenis_tatib saat ini

        $ta = $this->tahunAjaranAktif();
        $semester = $this->semesterDariTanggal($validated['tanggal']);

        $catatan = CatatanPelanggaran::create([
            'siswa_id' => $validated['siswa_id'],
            'jenis_pelanggaran_id' => $validated['jenis_pelanggaran_id'],
            'tahun_ajaran_id' => $ta->id,
            'dicatat_oleh' => $request->user()->id,
            'semester' => $semester,
            'tanggal' => $validated['tanggal'],
            'poin' => $poin,
            'tipe' => 'pelanggaran',
            'keterangan' => $validated['keterangan'] ?? null,
        ]);

        $catatan->load(['siswa', 'jenisPelanggaran', 'pencatat']);

        // Evaluasi otomatis: buat/eskalasi kasus pembinaan kalau ambang tercapai
        $kasus = app(TatibPembinaanService::class)->evaluasi($catatan);

        return (new CatatanPelanggaranResource($catatan))
            ->additional([
                'kasus_dibuat' => $kasus ? [
                    'id' => $kasus->id,
                    'judul' => $kasus->judul,
                    'baru' => $kasus->wasRecentlyCreated,
                ] : null,
            ])
            ->response()
            ->setStatusCode(201);

        return (new CatatanPelanggaranResource($catatan))->response()->setStatusCode(201);
    }

    // Penghapusan poin (kegiatan positif, -3, maks 1x/bulan)
    public function penghapusanPoin(StorePenghapusanPoinRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $ta = $this->tahunAjaranAktif();
        $semester = $this->semesterDariTanggal($validated['tanggal']);
        $bulan = Carbon::parse($validated['tanggal'])->month;
        $tahun = Carbon::parse($validated['tanggal'])->year;

        // Cek batasan maks 1x per bulan
        $sudahAda = CatatanPelanggaran::where('siswa_id', $validated['siswa_id'])
            ->where('tipe', 'penghapusan')
            ->whereMonth('tanggal', $bulan)
            ->whereYear('tanggal', $tahun)
            ->exists();

        if ($sudahAda) {
            return response()->json([
                'message' => 'Siswa ini sudah mendapat penghapusan poin bulan ini. Maksimal 1x per bulan.',
            ], 422);
        }

        $catatan = CatatanPelanggaran::create([
            'siswa_id' => $validated['siswa_id'],
            'jenis_pelanggaran_id' => null,
            'tahun_ajaran_id' => $ta->id,
            'dicatat_oleh' => $request->user()->id,
            'semester' => $semester,
            'tanggal' => $validated['tanggal'],
            'poin' => -3, // pengurangan
            'tipe' => 'penghapusan',
            'keterangan' => $validated['keterangan'],
        ]);

        $catatan->load(['siswa', 'pencatat']);

        return (new CatatanPelanggaranResource($catatan))->response()->setStatusCode(201);
    }

    public function destroy(CatatanPelanggaran $catatanPelanggaran): JsonResponse
    {
        $catatanPelanggaran->delete();

        return response()->json(['message' => 'Catatan berhasil dihapus.']);
    }
}