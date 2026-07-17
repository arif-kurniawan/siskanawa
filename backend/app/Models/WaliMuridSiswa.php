<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class WaliMuridSiswa extends Pivot
{
    protected $table = 'wali_murid_siswa';

    protected $fillable = [
        'wali_murid_id',
        'siswa_id',
        'hubungan',
        'is_primary',
    ];

    protected function casts(): array
    {
        return [
            'is_primary' => 'boolean',
        ];
    }
}