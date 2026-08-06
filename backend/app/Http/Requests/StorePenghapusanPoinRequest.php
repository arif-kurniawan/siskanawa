<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePenghapusanPoinRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'siswa_id' => ['required', 'exists:siswa,id'],
            'tanggal' => ['required', 'date', 'before_or_equal:today'],
            'keterangan' => ['required', 'string', 'max:1000'], // alasan wajib
        ];
    }

    public function messages(): array
    {
        return [
            'siswa_id.required' => 'Siswa wajib dipilih.',
            'keterangan.required' => 'Alasan penghapusan poin wajib diisi (mis. petugas upacara, juara lomba).',
            'tanggal.before_or_equal' => 'Tanggal tidak boleh di masa depan.',
        ];
    }
}