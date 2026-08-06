<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ResponsOrtu extends Model
{
    protected $table = 'respons_ortu';

    protected $fillable = ['tindak_lanjut_id', 'wali_murid_id', 'isi'];

    public function tindakLanjut(): BelongsTo
    {
        return $this->belongsTo(TindakLanjutKasus::class, 'tindak_lanjut_id');
    }

    public function waliMurid(): BelongsTo
    {
        return $this->belongsTo(WaliMurid::class);
    }

    public function responsOrtu(): HasMany
    {
        return $this->hasMany(ResponsOrtu::class, 'tindak_lanjut_id');
    }
}