<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PasalTatib extends Model
{
    protected $table = 'pasal_tatib';

    protected $fillable = ['kode', 'nama', 'urutan', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function jenisPelanggaran(): HasMany
    {
        return $this->hasMany(JenisPelanggaran::class);
    }
}