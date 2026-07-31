<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SesiSholat extends Model
{
    protected $table = 'sesi_sholat';

    protected $fillable = ['tanggal', 'waktu_buka', 'waktu_tutup', 'dibuka_oleh'];

    protected function casts(): array
    {
        return ['tanggal' => 'date'];
    }

    public function presensi(): HasMany
    {
        return $this->hasMany(PresensiSholat::class);
    }

    public function pembuka(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dibuka_oleh');
    }

    // Sesi hari ini (buat/ambil)
    public static function hariIni(): ?self
    {
        return static::whereDate('tanggal', today())->first();
    }
}