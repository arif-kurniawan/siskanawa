<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@smkn9malang.sch.id'],
            [
                'name' => 'Administrator',
                'password' => Hash::make('password'),
            ]
        );

        $admin->assignRole('kepala_sekolah');

        $kepsek = User::firstOrCreate(
            ['email' => 'ks@smkn9malang.sch.id'],
            [
                'name' => 'Kepala Sekolah',
                'password' => Hash::make('password'),
            ]
        );

        $kepsek->assignRole('kepala_sekolah');
    }
}