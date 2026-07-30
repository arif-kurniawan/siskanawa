<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SiswaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nis' => $this->nis,
            'nisn' => $this->nisn,
            'nama' => $this->user?->name,
            'email' => $this->user?->email,
            'jenis_kelamin' => $this->jenis_kelamin,
            'tempat_lahir' => $this->tempat_lahir,
            'tanggal_lahir' => $this->tanggal_lahir?->format('Y-m-d'),
            'alamat' => $this->alamat,
            'no_hp' => $this->no_hp,
            'status' => $this->status,
            'angkatan' => $this->angkatan,
            'jurusan' => $this->whenLoaded('jurusan', fn () => [
                'id' => $this->jurusan->id,
                'kode' => $this->jurusan->kode,
                'nama' => $this->jurusan->nama,
            ]),
            'kelas' => $this->whenLoaded('kelas', fn () => $this->kelas ? [
                'id' => $this->kelas->id,
                'nama_lengkap' => $this->kelas->nama_lengkap,
            ] : null),
        ];
    }
}