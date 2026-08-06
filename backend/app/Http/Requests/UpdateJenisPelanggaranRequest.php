<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateJenisPelanggaranRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'pasal_tatib_id' => ['required', 'exists:pasal_tatib,id'],
            'jenis_tatib_id' => ['required', 'exists:jenis_tatib,id'],
            'nama' => ['required', 'string', 'max:500'],
            'keterangan' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'pasal_tatib_id.required' => 'Pasal wajib dipilih.',
            'jenis_tatib_id.required' => 'Jenis (tingkat) wajib dipilih.',
            'nama.required' => 'Nama pelanggaran wajib diisi.',
        ];
    }
}