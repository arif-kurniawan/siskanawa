<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            'kepala_sekolah',
            'wakil_kepala_sekolah',
            'kaprodi',
            'guru_mapel',
            'wali_kelas',
            'guru_bk',
            'tendik',
            'siswa',
            'wali_murid',
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
        }

        // Permission umum core
        $permissions = [
            'manage-users',
            'manage-master-data',
            'view-dashboard-kepsek',
            'view-own-profile',
            'edit-own-profile',
            'presensi-sholat.scan',
            'presensi-sholat.kelola',
            'presensi-sholat.lihat-rekap',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        foreach ($permissions as $p) {
            \Spatie\Permission\Models\Permission::firstOrCreate(['name' => $p, 'guard_name' => 'web']);
        }

        // Guru & tendik bisa scan, kepsek & BK lihat rekap
        \Spatie\Permission\Models\Role::findByName('guru_mapel')->givePermissionTo('presensi-sholat.scan');
        \Spatie\Permission\Models\Role::findByName('tendik')->givePermissionTo(['presensi-sholat.scan', 'presensi-sholat.kelola']);
        \Spatie\Permission\Models\Role::findByName('guru_bk')->givePermissionTo(['presensi-sholat.scan', 'presensi-sholat.lihat-rekap']);
        \Spatie\Permission\Models\Role::findByName('kepala_sekolah')->givePermissionTo(['presensi-sholat.lihat-rekap']);

        // Assign permission ke role
        Role::findByName('kepala_sekolah')->givePermissionTo([
            'manage-users', 
            'manage-master-data', 
            'view-dashboard-kepsek',
            'view-own-profile',
            'edit-own-profile',
        ]);

        Role::findByName('tendik')->givePermissionTo([
            'manage-master-data',
            'view-own-profile',
            'edit-own-profile',
        ]);

        // Semua role bisa lihat dan edit profil sendiri
        foreach (['guru_mapel', 'wali_kelas', 'guru_bk', 'siswa', 'wali_murid', 'kaprodi', 'wakil_kepala_sekolah'] as $r) {
            Role::findByName($r)->givePermissionTo(['view-own-profile', 'edit-own-profile']);
        }

        $permissions = [
            'pembinaan.lihat',       // lihat kasus
            'pembinaan.buat',        // buat kasus & tindak lanjut
            'pembinaan.eskalasi',    // eskalasi kasus
            'pembinaan.rahasia',     // akses kasus rahasia (BK, kepsek)
        ];
        foreach ($permissions as $p) {
            \Spatie\Permission\Models\Permission::firstOrCreate(['name' => $p, 'guard_name' => 'web']);
        }

        Role::findByName('guru_mapel')->givePermissionTo(['pembinaan.lihat', 'pembinaan.buat']);
        Role::findByName('wali_kelas')->givePermissionTo(['pembinaan.lihat', 'pembinaan.buat', 'pembinaan.eskalasi']);
        Role::findByName('guru_bk')->givePermissionTo(['pembinaan.lihat', 'pembinaan.buat', 'pembinaan.eskalasi', 'pembinaan.rahasia']);
        Role::findByName('kepala_sekolah')->givePermissionTo(['pembinaan.lihat', 'pembinaan.buat', 'pembinaan.eskalasi', 'pembinaan.rahasia']);
    }
}