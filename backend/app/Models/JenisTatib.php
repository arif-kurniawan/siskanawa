<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JenisTatib extends Model
{
    protected $table = 'jenis_tatib';

    protected $fillable = ['kode', 'nama', 'poin', 'urutan', 'is_active'];

    protected function casts(): array
    {
        return [
            'poin' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function jenisPelanggaran(): HasMany
    {
        return $this->hasMany(JenisPelanggaran::class);
    }
}