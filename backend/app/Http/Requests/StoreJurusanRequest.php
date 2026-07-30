<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreJurusanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // otorisasi diatur di route/middleware
    }

    public function rules(): array
    {
        return [
            'kode' => ['required', 'string', 'max:10', 'unique:jurusan,kode'],
            'nama' => ['required', 'string', 'max:100'],
            'deskripsi' => ['nullable', 'string'],
            'kaprodi_id' => ['nullable', 'exists:users,id'],
            'is_active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'kode.required' => 'Kode jurusan wajib diisi.',
            'kode.unique' => 'Kode jurusan sudah digunakan.',
            'nama.required' => 'Nama jurusan wajib diisi.',
            'kaprodi_id.exists' => 'Kaprodi yang dipilih tidak valid.',
        ];
    }
}