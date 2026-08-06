<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PengaturanSanksi extends Model
{
    protected $table = 'pengaturan_sanksi';

    protected $fillable = [
        'nama', 'poin_min', 'poin_max', 'tindakan', 'level', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'poin_min' => 'integer',
            'poin_max' => 'integer',
            'level' => 'integer',
            'is_active' => 'boolean',
        ];
    }
}