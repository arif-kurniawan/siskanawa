<?php

namespace Database\Seeders;

use App\Models\Jurusan;
use App\Models\TahunAjaran;
use Illuminate\Database\Seeder;

class MasterDataSeeder extends Seeder
{
    public function run(): void
    {
        // Sesuaikan dengan 5 jurusan aktual di SMKN 9 Malang
        $jurusanList = [
            ['kode' => 'RPL', 'nama' => 'Rekayasa Perangkat Lunak'],
            ['kode' => 'TKJ', 'nama' => 'Teknik Komputer dan Jaringan'],
            ['kode' => 'TSM',  'nama' => 'Teknik Sepeda Motor'],
            ['kode' => 'ANM', 'nama' => 'Animasi'],
            ['kode' => 'TEI',  'nama' => 'Teknik Elektronika Industri'],
        ];

        foreach ($jurusanList as $j) {
            Jurusan::firstOrCreate(['kode' => $j['kode']], $j);
        }

        TahunAjaran::firstOrCreate(
            ['nama' => '2026/2027', 'semester' => 'ganjil'],
            [
                'tanggal_mulai' => '2026-07-13',
                'tanggal_selesai' => '2026-12-31',
                'is_active' => true,
            ]
        );
    }
}