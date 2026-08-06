<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KasusPembinaan;
use App\Models\TahunAjaran;
use App\Models\TindakLanjutKasus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KasusPembinaanController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = KasusPembinaan::query()
            ->with(['siswa.user', 'siswa.kelas', 'pelapor', 'penanggungJawab'])
            ->withCount('tindakLanjut');

        // Sembunyikan kasus rahasia dari yang tidak berhak
        if (! $user->hasAnyRole(['guru_bk', 'kepala_sekolah'])) {
            $query->where('is_rahasia', false);
        }

        // Wali kelas: hanya siswa di kelasnya
        if ($user->hasRole('wali_kelas') && ! $user->hasAnyRole(['guru_bk', 'kepala_sekolah'])) {
            $kelasWali = $user->kelasWali()->pluck('id');
            $query->whereHas('siswa', fn ($q) => $q->whereIn('kelas_id', $kelasWali));
        }
        // Guru biasa (bukan wali/bk/kepsek): hanya yang ia laporkan
        elseif ($user->hasRole('guru_mapel') && ! $user->hasAnyRole(['wali_kelas', 'guru_bk', 'kepala_sekolah'])) {
            $query->where('pelapor_id', $user->id);
        }

        // Filter
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($kategori = $request->query('kategori')) {
            $query->where('kategori', $kategori);
        }

        $kasus = $query->orderByDesc('created_at')->paginate(20);

        return response()->json($kasus);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'siswa_id' => ['required', 'exists:siswa,id'],
            'kategori' => ['required', 'in:kehadiran,akademik,etika,poin_tatib,lainnya'],
            'tingkat' => ['required', 'in:ringan,sedang,berat'],
            'judul' => ['required', 'string', 'max:150'],
            'deskripsi' => ['required', 'string'],
            'is_rahasia' => ['boolean'],
        ]);

        $user = $request->user();
        $taAktif = TahunAjaran::where('is_active', true)->first();

        // Hanya BK/kepsek boleh menandai rahasia
        $isRahasia = ($validated['is_rahasia'] ?? false)
            && $user->hasAnyRole(['guru_bk', 'kepala_sekolah']);

        // Level awal: kalau pelapor guru biasa, mulai di wali_kelas; kalau BK, di bk
        $levelAwal = 'wali_kelas';
        if ($user->hasRole('guru_bk')) $levelAwal = 'bk';

        $kasus = DB::transaction(function () use ($validated, $user, $taAktif, $isRahasia, $levelAwal) {
            $kasus = KasusPembinaan::create([
                'siswa_id' => $validated['siswa_id'],
                'kategori' => $validated['kategori'],
                'tingkat' => $validated['tingkat'],
                'judul' => $validated['judul'],
                'deskripsi' => $validated['deskripsi'],
                'status' => 'baru',
                'level_penanganan' => $levelAwal,
                'pelapor_id' => $user->id,
                'tahun_ajaran_id' => $taAktif?->id,
                'is_rahasia' => $isRahasia,
            ]);

            // Catat tindak lanjut awal
            TindakLanjutKasus::create([
                'kasus_pembinaan_id' => $kasus->id,
                'user_id' => $user->id,
                'jenis' => 'catatan',
                'isi' => 'Kasus dibuat: ' . $validated['judul'],
            ]);

            return $kasus;
        });

        $kasus->load(['siswa.user', 'pelapor']);

        return response()->json($kasus, 201);
    }

     
    public function show(Request $request, KasusPembinaan $kasusPembinaan): JsonResponse
    {
        $this->authorize('view', $kasusPembinaan);

        $kasusPembinaan->load([
            'siswa.user', 'siswa.kelas.jurusan',
            'pelapor', 'penanggungJawab',
            'tindakLanjut.user',
            'tindakLanjut.responsOrtu.waliMurid.user', // ← tambahkan ini
        ]);

        return response()->json($kasusPembinaan);
    }

    // Tambah tindak lanjut (catatan / komunikasi ortu)
    public function tambahTindakLanjut(Request $request, KasusPembinaan $kasusPembinaan): JsonResponse
    {
        $this->authorize('tambahTindakLanjut', $kasusPembinaan);

        $validated = $request->validate([
            'jenis' => ['required', 'in:catatan,komunikasi_ortu'],
            'isi' => ['required', 'string'],
            'ditujukan_ke_ortu' => ['boolean'],
            'ubah_status' => ['nullable', 'in:baru,ditangani,dipantau,selesai'],
        ]);

        DB::transaction(function () use ($validated, $request, $kasusPembinaan) {
            TindakLanjutKasus::create([
                'kasus_pembinaan_id' => $kasusPembinaan->id,
                'user_id' => $request->user()->id,
                'jenis' => $validated['jenis'],
                'isi' => $validated['isi'],
                'ditujukan_ke_ortu' => $validated['ditujukan_ke_ortu'] ?? false,
            ]);

            // Kalau sekalian ubah status
            if (! empty($validated['ubah_status']) && $validated['ubah_status'] !== $kasusPembinaan->status) {
                $statusLama = $kasusPembinaan->status;
                $kasusPembinaan->update([
                    'status' => $validated['ubah_status'],
                    'selesai_at' => $validated['ubah_status'] === 'selesai' ? now() : null,
                ]);

                TindakLanjutKasus::create([
                    'kasus_pembinaan_id' => $kasusPembinaan->id,
                    'user_id' => $request->user()->id,
                    'jenis' => 'perubahan_status',
                    'isi' => "Status diubah dari {$statusLama} menjadi {$validated['ubah_status']}",
                ]);
            }
        });

        return response()->json(['message' => 'Tindak lanjut ditambahkan.']);
    }

    // Eskalasi ke level berikutnya (berjenjang)
    public function eskalasi(Request $request, KasusPembinaan $kasusPembinaan): JsonResponse
    {
        $this->authorize('eskalasi', $kasusPembinaan);

        $validated = $request->validate([
            'catatan' => ['required', 'string'],
        ]);

        $levelBerikutnya = $kasusPembinaan->levelBerikutnya();

        if (! $levelBerikutnya) {
            return response()->json([
                'message' => 'Kasus sudah berada di level tertinggi (kepala sekolah).',
            ], 422);
        }

        DB::transaction(function () use ($kasusPembinaan, $levelBerikutnya, $validated, $request) {
            $levelLama = $kasusPembinaan->level_penanganan;

            $kasusPembinaan->update([
                'level_penanganan' => $levelBerikutnya,
                'status' => 'ditangani',
            ]);

            TindakLanjutKasus::create([
                'kasus_pembinaan_id' => $kasusPembinaan->id,
                'user_id' => $request->user()->id,
                'jenis' => 'eskalasi',
                'isi' => $validated['catatan'],
                'level_dari' => $levelLama,
                'level_ke' => $levelBerikutnya,
            ]);
        });

        return response()->json([
            'message' => "Kasus dieskalasi ke {$levelBerikutnya}.",
        ]);
    }
}