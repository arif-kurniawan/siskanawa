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
 
    public function tahunAjaran(): BelongsTo
    {
        return $this->belongsTo(TahunAjaran::class);
    }
 
    public function waliKelas(): BelongsTo
    {
        return $this->belongsTo(User::class, 'wali_kelas_id');
    }
 
    public function siswa(): HasMany
    {
        return $this->hasMany(Siswa::class);
    }
 
    // Accessor untuk nama lengkap kelas
    // Contoh output: "XI RPL 1"
    public function getNamaLengkapAttribute(): string
    {
        $jurusan = $this->jurusan?->kode ?? '-';
        return "{$this->tingkat} {$jurusan} {$this->nama_rombel}";
    }
 
    // Scope untuk kelas di tahun ajaran aktif
    public function scopeAktif($query)
    {
        return $query->whereHas('tahunAjaran', function ($q) {
            $q->where('is_active', true);
        });
    }
 
    // Scope untuk filter per tingkat
    public function scopeTingkat($query, string $tingkat)
    {
        return $query->where('tingkat', $tingkat);
    }
}