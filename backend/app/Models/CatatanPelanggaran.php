<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class CatatanPelanggaran extends Model
{
    protected $table = 'catatan_pelanggaran';

    protected $fillable = [
        'siswa_id',
        'jenis_pelanggaran_id',
        'tahun_ajaran_id',
        'dicatat_oleh',
        'semester',
        'tanggal',
        'poin',
        'tipe',
        'keterangan',
    ];

    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
            'poin' => 'integer',
        ];
    }

    public function siswa(): BelongsTo
    {
        return $this->belongsTo(Siswa::class);
    }

    public function jenisPelanggaran(): BelongsTo
    {
        return $this->belongsTo(JenisPelanggaran::class);
    }

    public function tahunAjaran(): BelongsTo
    {
        return $this->belongsTo(TahunAjaran::class);
    }

    public function pencatat(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dicatat_oleh');
    }

    // Scope: hanya semester + tahun ajaran tertentu
    public function scopePeriode(Builder $query, int $tahunAjaranId, string $semester): Builder
    {
        return $query->where('tahun_ajaran_id', $tahunAjaranId)
            ->where('semester', $semester);
    }
}