<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MataPelajaranResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'kode' => $this->kode,
            'nama' => $this->nama,
            'kategori' => $this->kategori,
            'jurusan' => $this->whenLoaded('jurusan', fn () => $this->jurusan ? [
                'id' => $this->jurusan->id,
                'kode' => $this->jurusan->kode,
                'nama' => $this->jurusan->nama,
            ] : null),
        ];
    }
}