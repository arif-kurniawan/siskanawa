<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSiswaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama' => ['required', 'string', 'max:100'],
            'nis' => ['required', 'string', 'max:20', 'unique:siswa,nis'],
            'nisn' => ['nullable', 'string', 'max:20', 'unique:siswa,nisn'],
            'jurusan_id' => ['required', 'exists:jurusan,id'],
            'kelas_id' => ['nullable', 'exists:kelas,id'],
            'jenis_kelamin' => ['required', 'in:L,P'],
            'tempat_lahir' => ['required', 'string', 'max:50'],
            'tanggal_lahir' => ['required', 'date'],
            'agama' => ['required', 'in:Islam,Kristen,Katolik,Hindu,Budha,Konghuchu'],
            'alamat' => ['required', 'string'],
            'no_hp' => ['nullable', 'string', 'max:20'],
            'angkatan' => ['required', 'integer', 'min:2000', 'max:2100'],
            'email' => ['nullable', 'email', 'unique:users,email'],
            'foto' => ['nullable', 'image', 'mimes:jpeg,jpg,png', 'max:2048'], // maks 2MB
        ];
    }

    public function messages(): array
    {
        return [
            'nis.unique' => 'NIS sudah terdaftar.',
            'nisn.unique' => 'NISN sudah terdaftar.',
            'email.unique' => 'Email sudah digunakan akun lain.',
            'jurusan_id.required' => 'Jurusan wajib dipilih.',
            'agama.in' => 'Agama yang dipilih tidak valid.',
            'foto.image' => 'File harus berupa gambar.',
            'foto.mimes' => 'Foto harus JPG atau PNG.',
            'foto.max' => 'Ukuran foto maksimal 2MB.',
        ];
    }
}