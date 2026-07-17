<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Tendik extends Model
{
    protected $table = 'tendik';

    protected $fillable = [
        'user_id',
        'nip',
        'jenis_kelamin',
        'tanggal_lahir',
        'no_hp',
        'alamat',
        'unit_kerja',
        'jabatan',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_lahir' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getNamaAttribute(): string
    {
        return $this->user?->name ?? '-';
    }

    public function getEmailAttribute(): string
    {
        return $this->user?->email ?? '-';
    }

    // Scope filter per unit kerja
    public function scopeUnitKerja($query, string $unit)
    {
        return $query->where('unit_kerja', $unit);
    }
}