<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Guru extends Model
{
    protected $table = 'guru';

    protected $fillable = [
        'user_id',
        'nip',
        'nuptk',
        'jenis_kelamin',
        'tanggal_lahir',
        'no_hp',
        'alamat',
        'status_kepegawaian',
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

    // Shortcut ke atribut user yang sering dipakai
    public function getNamaAttribute(): string
    {
        return $this->user?->name ?? '-';
    }

    public function getEmailAttribute(): string
    {
        return $this->user?->email ?? '-';
    }

    // Scope filter per status kepegawaian
    public function scopePns($query)
    {
        return $query->where('status_kepegawaian', 'PNS');
    }

    public function scopeNonPns($query)
    {
        return $query->whereIn('status_kepegawaian', ['GTT', 'GTY', 'Honorer']);
    }
}