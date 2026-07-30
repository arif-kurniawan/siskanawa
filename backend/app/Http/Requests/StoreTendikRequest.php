<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTendikRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'nama' => ['required', 'string', 'max:100'],
            'nip' => ['nullable', 'string', 'max:25', 'unique:tendik,nip'], // ignore saat update
            'jenis_kelamin' => ['required', 'in:L,P'],
            'tanggal_lahir' => ['nullable', 'date'],
            'no_hp' => ['nullable', 'string', 'max:20'],
            'alamat' => ['nullable', 'string'],
            'unit_kerja' => ['nullable', 'string', 'max:100'],
            'jabatan' => ['nullable', 'string', 'max:100'],
            'email' => ['nullable', 'email', 'unique:users,email'], // ignore saat update
        ];
    }

    public function messages(): array
    {
        return [
            'nip.unique' => 'NIP sudah terdaftar.',
            'email.unique' => 'Email sudah digunakan.',
        ];
    }
}