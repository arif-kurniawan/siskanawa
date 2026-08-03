<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Jurusan;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Kelas extends Model
{
    protected $table = 'kelas';

    protected $fillable = [
        'jurusan_id', 'tahun_ajaran_id', 'tingkat', 'nama_rombel', 'wali_kelas_id',
    ];

    // ... relasi & method yang sudah ada (jurusan, tahunAjaran, waliKelas, dst) ...

    protected static function booted(): void
    {
        // Sebelum menyimpan perubahan, cek apakah wali_kelas_id berubah
        static::saved(function (Kelas $kelas) {
            // Kalau kolom wali_kelas_id berubah dari nilai sebelumnya
            if ($kelas->wasChanged('wali_kelas_id')) {
                $waliLama = $kelas->getOriginal('wali_kelas_id');
                $waliBaru = $kelas->wali_kelas_id;

                // Beri role ke wali baru
                if ($waliBaru) {
                    $userBaru = User::find($waliBaru);
                    $userBaru?->assignRole('wali_kelas');
                }

                // Cabut role dari wali lama — TAPI hanya kalau dia
                // tidak lagi jadi wali di kelas manapun
                if ($waliLama) {
                    $userLama = User::find($waliLama);
                    if ($userLama) {
                        $masihWaliDiKelasLain = Kelas::where('wali_kelas_id', $waliLama)
                            ->where('id', '!=', $kelas->id)
                            ->exists();

                        if (! $masihWaliDiKelasLain) {
                            $userLama->removeRole('wali_kelas');
                        }
                    }
                }
            }
        });

        // Saat kelas dihapus, cabut role wali kalau perlu
        static::deleted(function (Kelas $kelas) {
            if ($kelas->wali_kelas_id) {
                $userLama = User::find($kelas->wali_kelas_id);
                if ($userLama) {
                    $masihWaliDiKelasLain = Kelas::where('wali_kelas_id', $kelas->wali_kelas_id)
                        ->where('id', '!=', $kelas->id)
                        ->exists();

                    if (! $masihWaliDiKelasLain) {
                        $userLama->removeRole('wali_kelas');
                    }
                }
            }
        });
    }

    public function jurusan(): BelongsTo
    {
        return $this->belongsTo(Jurusan::class);
    }
}