<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateGuruRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $guru = $this->route('guru');
        $userId = $guru->user_id;

        return [
            'nama' => ['required', 'string', 'max:100'],
            'nip' => ['nullable', 'string', 'max:25', Rule::unique('guru', 'nip')->ignore($guru->id)],
            'nuptk' => ['nullable', 'string', 'max:25', Rule::unique('guru', 'nuptk')->ignore($guru->id)],
            'jenis_kelamin' => ['required', 'in:L,P'],
            'tanggal_lahir' => ['nullable', 'date'],
            'no_hp' => ['nullable', 'string', 'max:20'],
            'alamat' => ['nullable', 'string'],
            'status_kepegawaian' => ['nullable', 'in:PNS,PPPK,GTT,GTY,Honorer'],
            'email' => ['nullable', 'email', Rule::unique('users', 'email')->ignore($userId)],
        ];
    }
}