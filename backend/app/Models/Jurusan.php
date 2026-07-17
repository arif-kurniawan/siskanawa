<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Jurusan extends Model
{
    protected $table = 'jurusan';
    
    protected $fillable = [
        'kode',
        'nama',
        'deskripsi',
        'kaprodi_id',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function kaprodi(): BelongsTo
    {
        return $this->belongsTo(User::class, 'kaprodi_id');
    }

    public function kelas(): HasMany
    {
        return $this->hasMany(Kelas::class);
    }

    public function siswa(): HasMany
    {
        return $this->hasMany(Siswa::class);
    }

    public function mataPelajaran(): HasMany
    {
        return $this->hasMany(MataPelajaran::class);
    }
}