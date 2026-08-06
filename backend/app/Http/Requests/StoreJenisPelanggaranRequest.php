<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreJenisPelanggaranRequest extends FormRequest
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
            'pasal_tatib_id.exists' => 'Pasal yang dipilih tidak valid.',
            'jenis_tatib_id.required' => 'Jenis (tingkat) wajib dipilih.',
            'jenis_tatib_id.exists' => 'Jenis yang dipilih tidak valid.',
            'nama.required' => 'Nama pelanggaran wajib diisi.',
        ];
    }
}