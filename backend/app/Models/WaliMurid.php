<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;


class WaliMurid extends Model
{
    protected $table = 'wali_murid';

    protected $fillable = [
        'user_id',
        'nik',
        'pekerjaan',
        'no_hp',
        'alamat',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Relasi many-to-many ke siswa (satu wali bisa punya banyak anak di sekolah)
    public function siswa(): BelongsToMany
    {
        return $this->belongsToMany(
            Siswa::class,
            'wali_murid_siswa',
            'wali_murid_id',
            'siswa_id'
        )->withPivot('hubungan', 'is_primary')->withTimestamps();
    }

    public function getNamaAttribute(): string
    {
        return $this->user?->name ?? '-';
    }

    public function getEmailAttribute(): string
    {
        return $this->user?->email ?? '-';
    }

    // Helper untuk dapat semua anak dari wali ini
    public function anakAktif()
    {
        return $this->siswa()->where('status', 'aktif');
    }

}