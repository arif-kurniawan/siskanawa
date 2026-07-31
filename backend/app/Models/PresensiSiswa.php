<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PresensiSiswa extends Model
{
    protected $table = 'presensi_siswa';

    protected $fillable = [
        'jurnal_mengajar_id', 'siswa_id', 'status', 'keterangan',
    ];

    public function jurnal(): BelongsTo
    {
        return $this->belongsTo(JurnalMengajar::class, 'jurnal_mengajar_id');
    }

    public function siswa(): BelongsTo
    {
        return $this->belongsTo(Siswa::class);
    }
}