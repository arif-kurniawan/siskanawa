<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JurnalMengajar extends Model
{
    protected $table = 'jurnal_mengajar';

    protected $fillable = [
        'kelas_id', 'mata_pelajaran_id', 'guru_id',
        'tanggal', 'jam_ke', 'materi', 'catatan',
    ];

    protected function casts(): array
    {
        return ['tanggal' => 'date'];
    }

    public function kelas(): BelongsTo
    {
        return $this->belongsTo(Kelas::class);
    }

    public function mataPelajaran(): BelongsTo
    {
        return $this->belongsTo(MataPelajaran::class);
    }

    public function guru(): BelongsTo
    {
        return $this->belongsTo(User::class, 'guru_id');
    }

    public function presensi(): HasMany
    {
        return $this->hasMany(PresensiSiswa::class);
    }

    // Ringkasan jumlah per status, untuk ditampilkan cepat
    public function getRekapAttribute(): array
    {
        $rekap = ['hadir' => 0, 'izin' => 0, 'sakit' => 0, 'alpa' => 0, 'dispensasi' => 0];
        foreach ($this->presensi as $p) {
            $rekap[$p->status] = ($rekap[$p->status] ?? 0) + 1;
        }
        return $rekap;
    }
}