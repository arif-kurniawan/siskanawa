<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreKelasRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'jurusan_id' => ['required', 'exists:jurusan,id'],
            'tahun_ajaran_id' => ['required', 'exists:tahun_ajaran,id'],
            'tingkat' => ['required', 'in:X,XI,XII'],
            'nama_rombel' => ['required', 'string', 'max:20'],
            'wali_kelas_id' => ['nullable', 'exists:users,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'jurusan_id.required' => 'Jurusan wajib dipilih.',
            'tahun_ajaran_id.required' => 'Tahun ajaran wajib dipilih.',
            'tingkat.in' => 'Tingkat harus X, XI, atau XII.',
            'nama_rombel.required' => 'Nama rombel wajib diisi.',
        ];
    }
}