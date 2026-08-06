<?php

namespace Database\Seeders;

use App\Models\PasalTatib;
use App\Models\JenisTatib;
use App\Models\JenisPelanggaran;
use App\Models\PengaturanSanksi;
use Illuminate\Database\Seeder;

class TatibSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Jenis (tingkat keparahan + poin)
        $jenisData = [
            ['kode' => 'HARIAN', 'nama' => 'Harian', 'poin' => 1, 'urutan' => 1],
            ['kode' => 'KHUSUS', 'nama' => 'Khusus', 'poin' => 3, 'urutan' => 2],
            ['kode' => 'BERAT',  'nama' => 'Berat',  'poin' => 10, 'urutan' => 3],
        ];
        foreach ($jenisData as $j) {
            JenisTatib::firstOrCreate(['kode' => $j['kode']], $j);
        }

        // 2. Pasal (kategori)
        $pasalData = [
            ['kode' => 'PASAL_1', 'nama' => 'Kerajinan', 'urutan' => 1],
            ['kode' => 'PASAL_2', 'nama' => 'Kerapian', 'urutan' => 2],
            ['kode' => 'PASAL_3', 'nama' => 'Kepribadian', 'urutan' => 3],
            ['kode' => 'PASAL_4', 'nama' => 'Ketertiban', 'urutan' => 4],
            ['kode' => 'PASAL_5', 'nama' => 'Sikap Terhadap Sekolah, Kepala Sekolah, Guru, Pegawai', 'urutan' => 5],
        ];
        foreach ($pasalData as $p) {
            PasalTatib::firstOrCreate(['kode' => $p['kode']], $p);
        }

        // Ambil id untuk referensi
        $harian = JenisTatib::where('kode', 'HARIAN')->first()->id;
        $khusus = JenisTatib::where('kode', 'KHUSUS')->first()->id;
        $berat  = JenisTatib::where('kode', 'BERAT')->first()->id;

        $p1 = PasalTatib::where('kode', 'PASAL_1')->first()->id;
        $p2 = PasalTatib::where('kode', 'PASAL_2')->first()->id;
        $p3 = PasalTatib::where('kode', 'PASAL_3')->first()->id;
        $p4 = PasalTatib::where('kode', 'PASAL_4')->first()->id;
        $p5 = PasalTatib::where('kode', 'PASAL_5')->first()->id;

        // 3. Jenis pelanggaran (dari Excel tim tatib)
        // Format: [pasal_id, jenis_id, nama]
        $pelanggaran = [
            // PASAL 1 — KERAJINAN
            [$p1, $harian, 'Terlambat masuk sekolah'],
            [$p1, $harian, 'Tidak mengikuti jam pelajaran'],
            [$p1, $harian, 'Terlambat karena ijin keluar'],
            [$p1, $harian, 'Ijin keluar bukan kegiatan sekolah'],
            [$p1, $harian, 'Tidak masuk karena ijin'],
            [$p1, $harian, 'Ijin keluar kelas tidak kembali lagi'],
            [$p1, $harian, 'Keluar kelas tanpa ijin dan tidak kembali'],
            [$p1, $khusus, 'Tidak masuk sekolah tanpa keterangan'],
            [$p1, $khusus, 'Tidak masuk dengan keterangan palsu'],
            [$p1, $khusus, 'Pulang sebelum waktunya tanpa keterangan'],
            [$p1, $khusus, 'Tidak mengikuti kegiatan upacara bendera'],
            [$p1, $khusus, 'Tidak mengikuti kegiatan sekolah (PHBN, PHBI, dll)'],
            [$p1, $khusus, 'Tidak mengikuti kegiatan keagamaan di sekolah'],

            // PASAL 2 — KERAPIAN
            [$p2, $harian, 'Tidak memakai seragam sesuai ketentuan'],
            [$p2, $harian, 'Atribut sekolah tidak lengkap'],
            [$p2, $harian, 'Tidak memasukkan baju bagi laki-laki'],
            [$p2, $harian, 'Memakai sepatu dengan warna selain hitam (bertali selain hitam)'],
            [$p2, $harian, 'Memakai topi di lingkungan sekolah (bukan topi sekolah)'],
            [$p2, $harian, 'Memakai jaket dan sejenisnya selain jaket organisasi resmi sekolah'],
            [$p2, $harian, 'Memakai sandal, sepatu sandal bukan karena sakit'],
            [$p2, $khusus, 'Mengubah bentuk seragam'],
            [$p2, $khusus, 'Memakai atribut sekolah lain'],
            [$p2, $khusus, 'Memakai perhiasan/aksesoris berlebihan'],
            [$p2, $khusus, 'Membawa/memakai make up berlebihan'],
            [$p2, $khusus, 'Murid berambut panjang/gondrong/model'],
            [$p2, $khusus, 'Murid mewarna rambut'],
            [$p2, $khusus, 'Mencat kuku tangan/kaki'],
            [$p2, $berat,  'Bertato dan bertindik'],

            // PASAL 3 — KEPRIBADIAN
            [$p3, $harian, 'Tidak melaksanakan piket kelas'],
            [$p3, $harian, 'Membuang sampah sembarangan'],
            [$p3, $harian, 'Merusak tanaman hias atau di taman'],
            [$p3, $khusus, 'Bermesraan di lingkungan sekolah dan sekitarnya'],
            [$p3, $khusus, 'Merusak inventaris sekolah'],
            [$p3, $khusus, 'Mencorat-coret dinding, meja, kursi, kaca, pintu milik sekolah'],
            [$p3, $khusus, 'Mencorat-coret buku paket, jurnal, data absensi milik sekolah'],
            [$p3, $berat,  'Melakukan tindakan asusila'],
            [$p3, $berat,  'Mencuri/mengambil dengan paksa milik orang lain'],
            [$p3, $berat,  'Merusak/menghilangkan barang milik guru, pegawai dan teman'],

            // PASAL 4 — KETERTIBAN
            [$p4, $harian, 'Mengaktifkan HP, MP3, portable dan sejenisnya saat jam pelajaran (bukan untuk kepentingan pelajaran yang telah diijinkan oleh guru mapel)'],
            [$p4, $harian, 'Mencharger HP, MP3, portabel dan sejenisnya di sekolah, kecuali media pembelajaran seperti laptop, tablet'],
            [$p4, $harian, 'Menerima tamu tanpa ijin guru piket/pihak sekolah'],
            [$p4, $harian, 'Menerima tamu di luar lingkungan sekolah'],
            [$p4, $harian, 'Naik kendaraan keluar/masuk sekolah'],
            [$p4, $khusus, 'Membawa rokok sendiri/titipan'],
            [$p4, $berat,  'Menghisap rokok di lingkungan sekolah dan sekitarnya'],
            [$p4, $berat,  'Memperjualbelikan rokok'],
            [$p4, $khusus, 'Membawa majalah, VCD, DVD, video porno milik sendiri atau titipan'],
            [$p4, $khusus, 'Membagikan gambar/video porno melalui HP'],
            [$p4, $khusus, 'Membawa dan menggunakan senjata yang membahayakan orang lain'],
            [$p4, $khusus, 'Membawa, menggunakan alat-alat perjudian'],
            [$p4, $khusus, 'Terlibat dalam perjudian dan sejenisnya'],
            [$p4, $khusus, 'Mengganggu kelas yang sedang belajar'],
            [$p4, $khusus, 'Ditemukan di luar sekolah saat jam pelajaran'],
            [$p4, $khusus, 'Naik kendaraan ugal-ugalan di lingkungan sekolah'],
            [$p4, $khusus, 'Melakukan kegiatan atas nama sekolah tanpa ijin sekolah'],
            [$p4, $berat,  'Membawa, memperjualbelikan, menggunakan narkotika dan sejenisnya'],
            [$p4, $berat,  'Berkelahi di lingkungan sekolah dan sekitarnya'],
            [$p4, $berat,  'Menghasut, memprovokasi tindakan perkelahian'],
            [$p4, $berat,  'Terlibat perkelahian di sekolah dan sekitarnya'],
            [$p4, $berat,  'Terlibat tawuran pelajar'],
            [$p4, $berat,  'Mengkoordinir, memprovokasi tindakan menentang sekolah'],
            [$p4, $berat,  'Terlibat dalam organisasi terlarang di luar sekolah'],

            // PASAL 5 — SIKAP TERHADAP SEKOLAH/GURU/PEGAWAI
            [$p5, $berat, 'Memalsukan tanda tangan kepala sekolah, guru, pegawai'],
            [$p5, $berat, 'Memalsukan stempel sekolah'],
            [$p5, $berat, 'Membuat surat sekolah palsu'],
            [$p5, $berat, 'Melawan kepala sekolah, guru, pegawai dengan ucapan kasar'],
            [$p5, $berat, 'Melawan kepala sekolah, guru, pegawai dengan tindakan'],
            [$p5, $berat, 'Melawan kepala sekolah, guru, pegawai disertai ancaman'],
        ];

        foreach ($pelanggaran as [$pasalId, $jenisId, $nama]) {
            JenisPelanggaran::firstOrCreate(
                ['nama' => $nama],
                ['pasal_tatib_id' => $pasalId, 'jenis_tatib_id' => $jenisId, 'is_active' => true]
            );
        }

        // 4. Pengaturan sanksi bertingkat (dari Excel)
        $sanksi = [
            ['nama' => 'Peringatan 1', 'poin_min' => 3, 'poin_max' => 5, 'level' => 1,
             'tindakan' => 'Peringatan ke-1; mengerjakan tugas kebersihan sekolah atau membantu tim tatib pukul 06.45; sanksi tindakan langsung yang bersifat mendidik.'],
            ['nama' => 'Peringatan 2', 'poin_min' => 6, 'poin_max' => 9, 'level' => 2,
             'tindakan' => 'Peringatan ke-2; mengerjakan tugas kebersihan sekolah atau membantu tim tatib pukul 06.45; sanksi tindakan langsung yang bersifat mendidik.'],
            ['nama' => 'SP1', 'poin_min' => 10, 'poin_max' => 24, 'level' => 3,
             'tindakan' => 'Surat Peringatan 1; pemanggilan dan pembinaan oleh wali kelas + BK; penandatanganan surat pernyataan tidak mengulang; pemberitahuan tertulis ke orang tua/wali via surat.'],
            ['nama' => 'SP2', 'poin_min' => 24, 'poin_max' => 39, 'level' => 4,
             'tindakan' => 'Surat Peringatan 2; pemanggilan orang tua ke sekolah (wajib hadir); pembinaan intensif oleh tim BK dan kesiswaan; kontrak perilaku; skorsing ringan 1-3 hari; tugas sosial/pengabdian 1-2 minggu.'],
            ['nama' => 'SP3', 'poin_min' => 40, 'poin_max' => 49, 'level' => 5,
             'tindakan' => 'Surat Peringatan 3; sidang kesiswaan (Kepsek, Waka Kesiswaan, Wali Kelas, BK, orang tua); skorsing 1 minggu dan wajib lapor setiap hari; surat pernyataan bermaterai dari orang tua; pendampingan khusus oleh BK 2x seminggu.'],
            ['nama' => 'Dikembalikan ke Orang Tua', 'poin_min' => 50, 'poin_max' => null, 'level' => 6,
             'tindakan' => 'Rapat dewan guru memutuskan murid dikembalikan ke orang tua; diberi surat rekomendasi pindah sekolah.'],
        ];
        foreach ($sanksi as $s) {
            PengaturanSanksi::firstOrCreate(['nama' => $s['nama']], $s);
        }
    }
}