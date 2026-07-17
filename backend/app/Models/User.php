<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Relasi ke profil
    public function guru(): HasOne
    {
        return $this->hasOne(Guru::class);
    }

    public function tendik(): HasOne
    {
        return $this->hasOne(Tendik::class);
    }

    public function siswa(): HasOne
    {
        return $this->hasOne(Siswa::class);
    }

    public function waliMurid(): HasOne
    {
        return $this->hasOne(WaliMurid::class);
    }

    // Helper untuk dapat profil aktif user
    // Return array [tipe, data] atau null kalau user hanya admin/kepsek
    public function profile(): ?array
    {
        if ($this->guru) return ['tipe' => 'guru', 'data' => $this->guru];
        if ($this->tendik) return ['tipe' => 'tendik', 'data' => $this->tendik];
        if ($this->siswa) return ['tipe' => 'siswa', 'data' => $this->siswa];
        if ($this->waliMurid) return ['tipe' => 'wali_murid', 'data' => $this->waliMurid];
        return null;
    }

    // Kelas yang di-walikan (kalau user ini wali kelas)
    public function kelasWali()
    {
        return $this->hasMany(Kelas::class, 'wali_kelas_id');
    }

    // Jurusan yang dipimpin (kalau user ini kaprodi)
    public function jurusanDipimpin()
    {
        return $this->hasMany(Jurusan::class, 'kaprodi_id');
    }
}