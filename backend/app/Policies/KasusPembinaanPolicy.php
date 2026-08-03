<?php

namespace App\Policies;

use App\Models\KasusPembinaan;
use App\Models\User;

class KasusPembinaanPolicy
{
    // Bisakah user melihat kasus ini?
    public function view(User $user, KasusPembinaan $kasus): bool
    {
        // Kasus rahasia: hanya BK & kepsek
        if ($kasus->is_rahasia) {
            return $user->hasAnyRole(['guru_bk', 'kepala_sekolah']);
        }

        // Kepsek & BK lihat semua
        if ($user->hasAnyRole(['kepala_sekolah', 'guru_bk'])) {
            return true;
        }

        // Pastikan relasi siswa ter-load
        $kasus->loadMissing('siswa');
        $kelasSiswa = $kasus->siswa?->kelas_id;

        // Wali kelas: kasus siswa di kelas yang ia walikan
        if ($user->hasRole('wali_kelas')) {
            $kelasWali = $user->kelasWali()->pluck('id')->map(fn ($id) => (int) $id);
            if ($kelasSiswa !== null && $kelasWali->contains((int) $kelasSiswa)) {
                return true;
            }
        }

        // Guru (termasuk wali kelas yang juga pelapor): kasus yang ia laporkan
        if ($kasus->pelapor_id === $user->id) {
            return true;
        }

        return false;
    }

    // Bisakah user membuat tindak lanjut di kasus ini?
    public function tambahTindakLanjut(User $user, KasusPembinaan $kasus): bool
    {
        return $this->view($user, $kasus);
    }

    // Bisakah user mengeskalasi kasus ini?
    public function eskalasi(User $user, KasusPembinaan $kasus): bool
    {
        if (! $user->hasPermissionTo('pembinaan.eskalasi')) {
            return false;
        }
        return $this->view($user, $kasus);
    }
}