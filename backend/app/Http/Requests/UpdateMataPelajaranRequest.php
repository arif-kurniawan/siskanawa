<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMataPelajaranRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $id = $this->route('mata_pelajaran')->id;

        return [
            'kode' => ['required', 'string', 'max:20', Rule::unique('mata_pelajaran', 'kode')->ignore($id)],
            'nama' => ['required', 'string', 'max:100'],
            'kategori' => ['required', 'in:umum,kejuruan,muatan_lokal'],
            'jurusan_id' => ['nullable', 'exists:jurusan,id'],
        ];
    }
}