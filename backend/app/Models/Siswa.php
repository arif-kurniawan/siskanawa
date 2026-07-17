<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Siswa extends Model
{
    protected $table = 'siswa';

    protected $fillable = [
        'user_id',
        'nis',
        'nisn',
        'kelas_id',
        'jurusan_id',
        'jenis_kelamin',
        'tanggal_lahir',
        'tempat_lahir',
        'alamat',
        'no_hp',
        'status',
        'angkatan',
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

    public function kelas(): BelongsTo
    {
        return $this->belongsTo(Kelas::class);
    }

    public function jurusan(): BelongsTo
    {
        return $this->belongsTo(Jurusan::class);
    }

    // Relasi many-to-many ke wali murid
    public function waliMurid(): BelongsToMany
    {
        return $this->belongsToMany(
            WaliMurid::class,
            'wali_murid_siswa',
            'siswa_id',
            'wali_murid_id'
        )->withPivot('hubungan', 'is_primary')->withTimestamps();
    }

    // Wali murid utama (primary)
    public function waliMuridUtama()
    {
        return $this->waliMurid()->wherePivot('is_primary', true)->first();
    }

    public function getNamaAttribute(): string
    {
        return $this->user?->name ?? '-';
    }

    public function getEmailAttribute(): string
    {
        return $this->user?->email ?? '-';
    }

    // Umur otomatis dari tanggal lahir
    public function getUmurAttribute(): int
    {
        return $this->tanggal_lahir?->age ?? 0;
    }

    // Scope siswa aktif
    public function scopeAktif($query)
    {
        return $query->where('status', 'aktif');
    }

    // Scope per angkatan
    public function scopeAngkatan($query, int $tahun)
    {
        return $query->where('angkatan', $tahun);
    }

    // Scope per jurusan
    public function scopeJurusan($query, int $jurusanId)
    {
        return $query->where('jurusan_id', $jurusanId);
    }
}