<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KasusPembinaan extends Model
{
    protected $table = 'kasus_pembinaan';

    protected $fillable = [
        'siswa_id', 'kategori', 'tingkat', 'judul', 'deskripsi',
        'status', 'level_penanganan', 'pelapor_id', 'penanggung_jawab_id',
        'tahun_ajaran_id', 'is_rahasia', 'selesai_at',
    ];

    protected function casts(): array
    {
        return [
            'is_rahasia' => 'boolean',
            'selesai_at' => 'datetime',
        ];
    }

    public function siswa(): BelongsTo
    {
        return $this->belongsTo(Siswa::class);
    }

    public function pelapor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'pelapor_id');
    }

    public function penanggungJawab(): BelongsTo
    {
        return $this->belongsTo(User::class, 'penanggung_jawab_id');
    }

    public function tindakLanjut(): HasMany
    {
        return $this->hasMany(TindakLanjutKasus::class)->orderBy('created_at');
    }

    // Urutan level untuk eskalasi berjenjang
    public const URUTAN_LEVEL = ['guru', 'wali_kelas', 'bk', 'kepala_sekolah'];

    // Level berikutnya dalam eskalasi (null kalau sudah paling atas)
    public function levelBerikutnya(): ?string
    {
        $idx = array_search($this->level_penanganan, self::URUTAN_LEVEL);
        return self::URUTAN_LEVEL[$idx + 1] ?? null;
    }
}