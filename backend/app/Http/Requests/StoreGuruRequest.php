<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreGuruRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'nama' => ['required', 'string', 'max:100'],
            'nip' => ['nullable', 'string', 'max:25', 'unique:guru,nip'],
            'nuptk' => ['nullable', 'string', 'max:25', 'unique:guru,nuptk'],
            'jenis_kelamin' => ['required', 'in:L,P'],
            'tanggal_lahir' => ['nullable', 'date'],
            'no_hp' => ['nullable', 'string', 'max:20'],
            'alamat' => ['nullable', 'string'],
            'status_kepegawaian' => ['nullable', 'in:PNS,PPPK,GTT,GTY,Honorer'],
            'email' => ['nullable', 'email', 'unique:users,email'],
        ];
    }

    public function messages(): array
    {
        return [
            'nip.unique' => 'NIP sudah terdaftar.',
            'nuptk.unique' => 'NUPTK sudah terdaftar.',
            'email.unique' => 'Email sudah digunakan.',
        ];
    }
}