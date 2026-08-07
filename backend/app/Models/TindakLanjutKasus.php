<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class TindakLanjutKasus extends Model
{
    protected $table = 'tindak_lanjut_kasus';

    protected $fillable = [
        'kasus_pembinaan_id', 'user_id', 'jenis', 'isi',
        'ditujukan_ke_ortu', 'level_dari', 'level_ke', 'foto_path',
        'dokumen_path',
    ];

    protected $appends = ['foto_url', 'dokumen_url'];

    protected static function booted(): void
    {
        static::deleting(function (TindakLanjutKasus $tindakLanjut) {
            if ($tindakLanjut->foto_path) {
                Storage::disk('public')->delete($tindakLanjut->foto_path);
            }
            if ($tindakLanjut->dokumen_path) {
                Storage::disk('public')->delete($tindakLanjut->dokumen_path);
            }
        });
    }

    protected function casts(): array
    {
        return ['ditujukan_ke_ortu' => 'boolean'];
    }

    public function kasus(): BelongsTo
    {
        return $this->belongsTo(KasusPembinaan::class, 'kasus_pembinaan_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function responsOrtu(): HasMany
    {
        return $this->hasMany(ResponsOrtu::class, 'tindak_lanjut_id');
    }

    public function getFotoUrlAttribute(): ?string
    {
        return $this->foto_path ? asset('storage/' . $this->foto_path) : null;
    }

    public function getDokumenUrlAttribute(): ?string
    {
        return $this->dokumen_path ? asset('storage/' . $this->dokumen_path) : null;
    }
}