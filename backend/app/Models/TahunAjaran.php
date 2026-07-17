<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TahunAjaran extends Model
{
    protected $table = 'tahun_ajaran';

    protected $fillable = [
        'nama',
        'semester',
        'tanggal_mulai',
        'tanggal_selesai',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_mulai' => 'date',
            'tanggal_selesai' => 'date',
            'is_active' => 'boolean',
        ];
    }

    public function kelas(): HasMany
    {
        return $this->hasMany(Kelas::class);
    }

    // Scope untuk ambil tahun ajaran aktif
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Helper untuk dapat tahun ajaran aktif saat ini
    public static function active(): ?self
    {
        return static::where('is_active', true)->first();
    }
}
