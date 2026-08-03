<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PenugasanMengajar extends Model
{
    protected $table = 'penugasan_mengajar';

    protected $fillable = [
        'guru_id', 'mata_pelajaran_id', 'kelas_id', 'tahun_ajaran_id',
    ];

    // ... relasi yang sudah ada ...

    protected static function booted(): void
    {
        // Saat penugasan dibuat
        static::created(function (PenugasanMengajar $penugasan) {
            if ($penugasan->isMapelBK()) {
                $guru = User::find($penugasan->guru_id);
                $guru?->assignRole('guru_bk');
            }
        });

        // Saat penugasan dihapus
        static::deleted(function (PenugasanMengajar $penugasan) {
            if ($penugasan->isMapelBK()) {
                $guru = User::find($penugasan->guru_id);
                if ($guru) {
                    // Cabut role BK hanya kalau dia tidak lagi mengampu BK di penugasan lain
                    $masihMengampuBK = PenugasanMengajar::where('guru_id', $penugasan->guru_id)
                        ->where('id', '!=', $penugasan->id)
                        ->whereHas('mataPelajaran', fn ($q) => $q->where('kode', 'BK'))
                        ->exists();

                    if (! $masihMengampuBK) {
                        $guru->removeRole('guru_bk');
                    }
                }
            }
        });
    }

    // Cek apakah penugasan ini untuk mapel BK
    public function isMapelBK(): bool
    {
        return $this->mataPelajaran?->kode === 'BK';
    }

    // ... relasi guru, mataPelajaran, kelas, tahunAjaran ...
}