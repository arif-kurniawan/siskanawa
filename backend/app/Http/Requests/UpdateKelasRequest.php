<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateKelasRequest extends FormRequest
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
}