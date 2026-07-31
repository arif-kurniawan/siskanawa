<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PresensiSholat extends Model
{
    protected $table = 'presensi_sholat';

    protected $fillable = ['sesi_sholat_id', 'siswa_id', 'waktu_scan', 'petugas_id', 'metode'];

    protected function casts(): array
    {
        return ['waktu_scan' => 'datetime'];
    }

    public function sesi(): BelongsTo
    {
        return $this->belongsTo(SesiSholat::class, 'sesi_sholat_id');
    }

    public function siswa(): BelongsTo
    {
        return $this->belongsTo(Siswa::class);
    }

    public function petugas(): BelongsTo
    {
        return $this->belongsTo(User::class, 'petugas_id');
    }
}