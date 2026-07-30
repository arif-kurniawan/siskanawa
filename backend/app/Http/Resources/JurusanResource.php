<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JurusanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'kode' => $this->kode,
            'nama' => $this->nama,
            'deskripsi' => $this->deskripsi,
            'is_active' => $this->is_active,
            'kaprodi' => $this->whenLoaded('kaprodi', fn () => [
                'id' => $this->kaprodi?->id,
                'name' => $this->kaprodi?->name,
            ]),
            'jumlah_siswa' => $this->whenCounted('siswa'),
            'created_at' => $this->created_at,
        ];
    }
}