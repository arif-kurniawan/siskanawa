<?php

namespace App\Services;

use App\Models\CatatanPelanggaran;
use App\Models\JenisPelanggaran;
use App\Models\KasusPembinaan;
use App\Models\Siswa;
use App\Models\TahunAjaran;
use App\Models\User;

class TatibPembinaanService
{
    // Level sanksi minimal yang memicu kasus pembinaan (SP1 = level 3)
    private const LEVEL_PICU_KASUS = 3;

    /**
     * Dipanggil setelah pencatatan pelanggaran.
     * Mengevaluasi apakah perlu membuat/memperbarui kasus pembinaan.
     */
    public function evaluasi(CatatanPelanggaran $catatan): ?KasusPembinaan
    {
        $siswa = $catatan->siswa;
        $ta = TahunAjaran::where('is_active', true)->first();
        if (! $ta) {
            return null;
        }

        // Total poin siswa pada periode ini
        $totalPoin = $siswa->totalPoin($ta->id, $catatan->semester);

        // Sanksi yang berlaku untuk total poin tsb
        $sanksi = SanksiService::untukPoin($totalPoin);

        // Cek apakah pelanggaran yang baru dicatat berjenis Berat
        $adalahBerat = $this->cekPelanggaranBerat($catatan);

        // Tentukan apakah perlu kasus:
        // (1) sanksi mencapai level SP1+ ATAU
        // (2) pelanggaran berat (bisa langsung eskalasi meski poin rendah)
        $perluKasus = ($sanksi && $sanksi->level >= self::LEVEL_PICU_KASUS) || $adalahBerat;

        if (! $perluKasus) {
            return null;
        }

        // Anti-duplikasi: kalau sudah ada kasus poin_tatib aktif, jangan buat baru
        $kasusAktif = KasusPembinaan::where('siswa_id', $siswa->id)
            ->where('kategori', 'poin_tatib')
            ->where('tahun_ajaran_id', $ta->id)
            ->whereIn('status', ['baru', 'ditangani', 'dipantau'])
            ->first();

        if ($kasusAktif) {
            // Sudah ada kasus aktif — cukup catat perkembangan, tidak buat baru
            $this->catatPerkembangan($kasusAktif, $catatan, $totalPoin, $sanksi?->nama);
            return $kasusAktif;
        }

        // Buat kasus baru
        return $this->buatKasus($siswa, $catatan, $totalPoin, $sanksi, $adalahBerat, $ta);
    }

    private function cekPelanggaranBerat(CatatanPelanggaran $catatan): bool
    {
        if (! $catatan->jenis_pelanggaran_id) {
            return false;
        }
        $jenis = JenisPelanggaran::with('jenis')->find($catatan->jenis_pelanggaran_id);
        return $jenis?->jenis?->kode === 'BERAT';
    }

    private function buatKasus(
        Siswa $siswa,
        CatatanPelanggaran $catatan,
        int $totalPoin,
        $sanksi,
        bool $adalahBerat,
        TahunAjaran $ta
    ): KasusPembinaan {
        // Tingkat keparahan kasus mengikuti sanksi / jenis pelanggaran
        $tingkat = 'sedang';
        if ($adalahBerat || ($sanksi && $sanksi->level >= 5)) {
            $tingkat = 'berat';
        } elseif ($sanksi && $sanksi->level >= 4) {
            $tingkat = 'berat';
        }

        $judul = $adalahBerat
            ? "Pelanggaran berat tata tertib"
            : "Akumulasi poin tatib mencapai {$sanksi->nama}";

        $deskripsi = $this->susunDeskripsi($totalPoin, $sanksi?->nama, $catatan, $adalahBerat);

        // Penanggung jawab awal: wali kelas siswa (kalau ada), jika tidak, pelapor
        $penanggungJawab = $this->tentukanPenanggungJawab($siswa, $catatan);

        $kasus = KasusPembinaan::create([
            'siswa_id' => $siswa->id,
            'kategori' => 'poin_tatib',
            'tingkat' => $tingkat,
            'judul' => $judul,
            'deskripsi' => $deskripsi,
            'status' => 'baru',
            'pelapor_id' => $catatan->dicatat_oleh,
            'penanggung_jawab_id' => $penanggungJawab,
            'tahun_ajaran_id' => $ta->id,
            'is_rahasia' => false,
        ]);

        // Catat tindak lanjut awal (linimasa)
        $kasus->tindakLanjut()->create([
            'user_id' => $catatan->dicatat_oleh,
            'jenis' => 'catatan',
            'isi' => "Kasus dibuat otomatis oleh sistem tata tertib. {$deskripsi}",
            'ditujukan_ke_ortu' => false,
        ]);

        return $kasus;
    }

    private function catatPerkembangan(
        KasusPembinaan $kasus,
        CatatanPelanggaran $catatan,
        int $totalPoin,
        ?string $namaSanksi
    ): void {
        $pelanggaran = $catatan->jenisPelanggaran?->nama ?? 'pelanggaran';
        $isi = "Pelanggaran baru dicatat: {$pelanggaran} (+{$catatan->poin} poin). "
            . "Total poin sekarang {$totalPoin}."
            . ($namaSanksi ? " Status sanksi: {$namaSanksi}." : '');

        $kasus->tindakLanjut()->create([
            'user_id' => $catatan->dicatat_oleh,
            'jenis' => 'catatan',
            'isi' => $isi,
            'ditujukan_ke_ortu' => false,
        ]);
    }

    private function susunDeskripsi(
        int $totalPoin,
        ?string $namaSanksi,
        CatatanPelanggaran $catatan,
        bool $adalahBerat
    ): string {
        if ($adalahBerat) {
            $pelanggaran = $catatan->jenisPelanggaran?->nama ?? 'pelanggaran berat';
            return "Siswa melakukan pelanggaran berat: {$pelanggaran}. "
                . "Total poin saat ini {$totalPoin}. "
                . "Sesuai ketentuan, pelanggaran berat dapat langsung dieskalasi.";
        }

        return "Akumulasi poin pelanggaran siswa mencapai {$totalPoin}, "
            . "masuk kategori sanksi {$namaSanksi}. "
            . "Perlu pembinaan dan pemanggilan sesuai ketentuan tata tertib.";
    }

    private function tentukanPenanggungJawab(Siswa $siswa, CatatanPelanggaran $catatan): int
    {
        // Cari wali kelas dari kelas siswa
        $siswa->loadMissing('kelas');
        $waliKelasId = $siswa->kelas?->wali_kelas_id;

        // Kalau ada wali kelas, dialah penanggung jawab awal; jika tidak, pencatat
        return $waliKelasId ?? $catatan->dicatat_oleh;
    }
}