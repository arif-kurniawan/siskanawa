<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreWaliMuridRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'email' => ['nullable', 'email', 'unique:users,email'],
            'nik' => ['nullable', 'string', 'max:20', 'unique:wali_murid,nik'],
            'pekerjaan' => ['nullable', 'string', 'max:100'],
            'no_hp' => ['required', 'string', 'max:20'],
            'alamat' => ['required', 'string'],
            // Anak-anak yang dihubungkan (opsional saat buat)
            'anak' => ['nullable', 'array'],
            'anak.*.siswa_id' => ['required', 'exists:siswa,id'],
            'anak.*.hubungan' => ['required', 'in:ayah,ibu,wali'],
            'anak.*.is_primary' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama wali wajib diisi.',
            'email.unique' => 'Email sudah digunakan.',
            'nik.unique' => 'NIK sudah terdaftar.',
            'no_hp.required' => 'Nomor HP wajib diisi.',
            'alamat.required' => 'Alamat wajib diisi.',
            'anak.*.siswa_id.exists' => 'Siswa yang dipilih tidak valid.',
            'anak.*.hubungan.in' => 'Hubungan harus ayah, ibu, atau wali.',
        ];
    }
}