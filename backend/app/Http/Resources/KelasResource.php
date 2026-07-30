<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class KelasResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tingkat' => $this->tingkat,
            'nama_rombel' => $this->nama_rombel,
            'nama_lengkap' => $this->nama_lengkap, // accessor dari model: "XI RPL 1"
            'jurusan' => $this->whenLoaded('jurusan', fn () => [
                'id' => $this->jurusan->id,
                'kode' => $this->jurusan->kode,
                'nama' => $this->jurusan->nama,
            ]),
            'tahun_ajaran' => $this->whenLoaded('tahunAjaran', fn () => [
                'id' => $this->tahunAjaran->id,
                'nama' => $this->tahunAjaran->nama,
                'semester' => $this->tahunAjaran->semester,
            ]),
            'wali_kelas' => $this->whenLoaded('waliKelas', fn () => $this->waliKelas ? [
                'id' => $this->waliKelas->id,
                'name' => $this->waliKelas->name,
            ] : null),
            'jumlah_siswa' => $this->whenCounted('siswa'),
        ];
    }
}