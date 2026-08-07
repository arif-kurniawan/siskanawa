<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSiswaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $siswa = $this->route('siswa');
        $userId = $siswa->user_id;

        return [
            'nama' => ['required', 'string', 'max:100'],
            'nis' => ['required', 'string', 'max:20', Rule::unique('siswa', 'nis')->ignore($siswa->id)],
            'nisn' => ['nullable', 'string', 'max:20', Rule::unique('siswa', 'nisn')->ignore($siswa->id)],
            'jurusan_id' => ['required', 'exists:jurusan,id'],
            'kelas_id' => ['nullable', 'exists:kelas,id'],
            'jenis_kelamin' => ['required', 'in:L,P'],
            'tempat_lahir' => ['required', 'string', 'max:50'],
            'tanggal_lahir' => ['required', 'date'],
            'agama' => ['required', 'in:islam,kristen,katolik,hindu,buddha,konghucu'],
            'alamat' => ['required', 'string'],
            'no_hp' => ['nullable', 'string', 'max:20'],
            'angkatan' => ['required', 'integer', 'min:2000', 'max:2100'],
            'status' => ['required', 'in:aktif,lulus,pindah,keluar'],
            'email' => ['nullable', 'email', Rule::unique(  'users', 'email')->ignore($userId)],
            'foto' => ['nullable', 'image', 'mimes:jpeg,jpg,png', 'max:2048'], // maks 2MB
        ];
    }
}