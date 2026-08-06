<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WaliMuridResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nama' => $this->user?->name ?? '-',
            'email' => $this->user?->email,
            'nik' => $this->nik,
            'pekerjaan' => $this->pekerjaan,
            'no_hp' => $this->no_hp,
            'alamat' => $this->alamat,
            'jumlah_anak' => $this->whenCounted('siswa'),
            'anak' => $this->whenLoaded('siswa', fn () => $this->siswa->map(fn ($s) => [
                'siswa_id' => $s->id,
                'nama' => $s->user?->name ?? $s->nama,
                'nis' => $s->nis,
                'kelas' => $s->kelas?->nama_lengkap ?? '-',
                'hubungan' => $s->pivot->hubungan,
                'is_primary' => (bool) $s->pivot->is_primary,
            ])),
        ];
    }
}