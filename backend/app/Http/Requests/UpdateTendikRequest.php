<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTendikRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $tendik = $this->route('tendik');
        $userId = $tendik->user_id;

        return [
            'nama' => ['required', 'string', 'max:100'],
            'nip' => ['nullable', 'string', 'max:25', Rule::unique('tendik', 'nip')->ignore($tendik->id)],
            'jenis_kelamin' => ['required', 'in:L,P'],
            'tanggal_lahir' => ['nullable', 'date'],
            'no_hp' => ['nullable', 'string', 'max:20'],
            'alamat' => ['nullable', 'string'],
            'unit_kerja' => ['nullable', 'string', 'max:100'],
            'jabatan' => ['nullable', 'string', 'max:100'],
            'email' => ['nullable', 'email', Rule::unique('users', 'email')->ignore($userId)],
        ];
    }
}