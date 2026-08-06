<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CatatanPelanggaranResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tanggal' => $this->tanggal?->format('Y-m-d'),
            'poin' => $this->poin,
            'tipe' => $this->tipe,
            'keterangan' => $this->keterangan,
            'semester' => $this->semester,
            'siswa' => $this->whenLoaded('siswa', fn () => [
                'id' => $this->siswa->id,
                'nama' => $this->siswa->nama,
                'nis' => $this->siswa->nis,
            ]),
            'jenis_pelanggaran' => $this->whenLoaded('jenisPelanggaran', function () {
                if (!$this->jenisPelanggaran) return null;
                return [
                    'id' => $this->jenisPelanggaran->id,
                    'nama' => $this->jenisPelanggaran->nama,
                ];
            }),
            'pencatat' => $this->whenLoaded('pencatat', fn () => [
                'id' => $this->pencatat->id,
                'name' => $this->pencatat->name,
            ]),
            'created_at' => $this->created_at?->format('Y-m-d H:i'),
        ];
    }
}