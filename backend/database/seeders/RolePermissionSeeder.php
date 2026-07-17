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
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

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
    }
}