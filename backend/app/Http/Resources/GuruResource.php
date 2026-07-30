<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GuruResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nama' => $this->user?->name,
            'email' => $this->user?->email,
            'nip' => $this->nip,
            'nuptk' => $this->nuptk,
            'jenis_kelamin' => $this->jenis_kelamin,
            'tanggal_lahir' => $this->tanggal_lahir?->format('Y-m-d'),
            'no_hp' => $this->no_hp,
            'alamat' => $this->alamat,
            'status_kepegawaian' => $this->status_kepegawaian,
        ];
    }
}