<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MataPelajaran extends Model
{
    protected $table = 'mata_pelajaran';

    protected $fillable = [
        'kode',
        'nama',
        'kategori',
        'jurusan_id',
    ];

    public function jurusan(): BelongsTo
    {
        return $this->belongsTo(Jurusan::class);
    }

    // Scope untuk filter kategori
    public function scopeUmum($query)
    {
        return $query->where('kategori', 'umum');
    }

    public function scopeKejuruan($query)
    {
        return $query->where('kategori', 'kejuruan');
    }

    public function scopeMuatanLokal($query)
    {
        return $query->where('kategori', 'muatan_lokal');
    }

    // Scope untuk filter mapel berdasarkan jurusan
    // (termasuk mapel umum yang tidak terikat jurusan)
    public function scopeForJurusan($query, int $jurusanId)
    {
        return $query->where(function ($q) use ($jurusanId) {
            $q->where('kategori', 'umum')
              ->orWhere('jurusan_id', $jurusanId);
        });
    }
}