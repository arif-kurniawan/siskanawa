<?php

namespace App\Services;

use App\Models\PengaturanSanksi;

class SanksiService
{
    // Cari sanksi yang berlaku untuk total poin tertentu
    public static function untukPoin(int $poin): ?PengaturanSanksi
    {
        return PengaturanSanksi::where('is_active', true)
            ->where('poin_min', '<=', $poin)
            ->where(function ($q) use ($poin) {
                $q->whereNull('poin_max')->orWhere('poin_max', '>=', $poin);
            })
            ->orderByDesc('level')
            ->first();
    }
}