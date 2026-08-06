<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JenisPelanggaran extends Model
{
    protected $table = 'jenis_pelanggaran';

    protected $fillable = [
        'pasal_tatib_id',
        'jenis_tatib_id',
        'nama',
        'keterangan',
        'is_active',
    ];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function pasal(): BelongsTo
    {
        return $this->belongsTo(PasalTatib::class, 'pasal_tatib_id');
    }

    public function jenis(): BelongsTo
    {
        return $this->belongsTo(JenisTatib::class, 'jenis_tatib_id');
    }

    // Shortcut poin dari jenis (Harian/Khusus/Berat)
    public function getPoinAttribute(): int
    {
        return $this->jenis?->poin ?? 0;
    }
}