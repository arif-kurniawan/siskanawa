<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JenisPelanggaranResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nama' => $this->nama,
            'keterangan' => $this->keterangan,
            'is_active' => $this->is_active,
            'poin' => $this->poin, // dari accessor, ikut jenis_tatib
            'pasal' => $this->whenLoaded('pasal', fn () => [
                'id' => $this->pasal->id,
                'kode' => $this->pasal->kode,
                'nama' => $this->pasal->nama,
            ]),
            'jenis' => $this->whenLoaded('jenis', fn () => [
                'id' => $this->jenis->id,
                'kode' => $this->jenis->kode,
                'nama' => $this->jenis->nama,
                'poin' => $this->jenis->poin,
            ]),
        ];
    }
}