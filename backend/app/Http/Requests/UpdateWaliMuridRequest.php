<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateWaliMuridRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $wali = $this->route('waliMurid');
        $userId = $wali?->user_id;

        return [
            'name' => ['required', 'string', 'max:100'],
            'email' => ['nullable', 'email', Rule::unique('users', 'email')->ignore($userId)],
            'nik' => ['nullable', 'string', 'max:20', Rule::unique('wali_murid', 'nik')->ignore($wali->id)],
            'pekerjaan' => ['nullable', 'string', 'max:100'],
            'no_hp' => ['required', 'string', 'max:20'],
            'alamat' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama wali wajib diisi.',
            'email.unique' => 'Email sudah digunakan.',
            'nik.unique' => 'NIK sudah terdaftar.',
        ];
    }
}