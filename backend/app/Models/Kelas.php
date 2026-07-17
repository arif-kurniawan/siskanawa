<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Kelas extends Model
{
    protected $table = 'kelas';

    protected $fillable = [
        'jurusan_id',
        'tahun_ajaran_id',
        'tingkat',
        'nama_rombel',
        'wali_kelas_id',
    ];

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