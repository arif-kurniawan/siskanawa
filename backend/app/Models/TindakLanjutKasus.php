<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TindakLanjutKasus extends Model
{
    protected $table = 'tindak_lanjut_kasus';

    protected $fillable = [
        'kasus_pembinaan_id', 'user_id', 'jenis', 'isi',
        'ditujukan_ke_ortu', 'level_dari', 'level_ke',
    ];

    protected function casts(): array
    {
        return ['ditujukan_ke_ortu' => 'boolean'];
    }

    public function kasus(): BelongsTo
    {
        return $this->belongsTo(KasusPembinaan::class, 'kasus_pembinaan_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}