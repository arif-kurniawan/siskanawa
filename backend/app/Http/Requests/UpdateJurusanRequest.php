<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateJurusanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $jurusanId = $this->route('jurusan')->id;

        return [
            'kode' => ['required', 'string', 'max:10', Rule::unique('jurusan', 'kode')->ignore($jurusanId)],
            'nama' => ['required', 'string', 'max:100'],
            'deskripsi' => ['nullable', 'string'],
            'kaprodi_id' => ['nullable', 'exists:users,id'],
            'is_active' => ['boolean'],
        ];
    }
}