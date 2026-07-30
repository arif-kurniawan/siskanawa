<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTahunAjaranRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama' => ['required', 'string', 'max:20'],
            'semester' => ['required', 'in:ganjil,genap'],
            'tanggal_mulai' => ['required', 'date'],
            'tanggal_selesai' => ['required', 'date', 'after:tanggal_mulai'],
            'is_active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'nama.required' => 'Nama tahun ajaran wajib diisi (contoh: 2025/2026).',
            'semester.in' => 'Semester harus ganjil atau genap.',
            'tanggal_selesai.after' => 'Tanggal selesai harus setelah tanggal mulai.',
        ];
    }
}