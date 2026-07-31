<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMataPelajaranRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'kode' => ['required', 'string', 'max:20', 'unique:mata_pelajaran,kode'],
            'nama' => ['required', 'string', 'max:100'],
            'kategori' => ['required', 'in:umum,kejuruan,muatan_lokal'],
            'jurusan_id' => ['nullable', 'exists:jurusan,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'kode.unique' => 'Kode mata pelajaran sudah digunakan.',
            'kategori.in' => 'Kategori harus umum, kejuruan, atau muatan lokal.',
        ];
    }
}