<?php

namespace App\Console\Commands;

use App\Models\Siswa;
use App\Models\User;
use App\Models\WaliMurid;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class GenerateAkunWali extends Command
{
    protected $signature = 'wali:generate {--dry-run : Hanya tampilkan, tidak menyimpan}';
    protected $description = 'Generate akun wali murid dari data siswa yang belum punya wali';

    public function handle(): int
    {
        $dryRun = $this->option('dry-run');

        // Siswa aktif yang belum punya wali murid terhubung
        $siswaTanpaWali = Siswa::with('user')
            ->where('status', 'aktif')
            ->whereDoesntHave('waliMurid')
            ->get();

        if ($siswaTanpaWali->isEmpty()) {
            $this->info('Semua siswa aktif sudah punya wali. Tidak ada yang perlu digenerate.');
            return self::SUCCESS;
        }

        $this->info("Ditemukan {$siswaTanpaWali->count()} siswa tanpa wali.");
        if ($dryRun) {
            $this->warn('Mode dry-run: tidak ada yang disimpan.');
        }

        $bar = $this->output->createProgressBar($siswaTanpaWali->count());
        $bar->start();
        $dibuat = 0;

        foreach ($siswaTanpaWali as $siswa) {
            if (! $dryRun) {
                DB::transaction(function () use ($siswa) {
                    $namaWali = 'Wali dari ' . ($siswa->user?->name ?? "Siswa {$siswa->nis}");
                    // No HP ambil dari siswa kalau ada, kalau tidak placeholder
                    $noHp = $siswa->no_hp ?: '00000000000';

                    $user = User::create([
                        'name' => $namaWali,
                        'email' => 'wali.' . $siswa->nis . '@wali.smkn9-malang.sch.id',
                        'password' => Hash::make($noHp),
                    ]);
                    $user->assignRole('wali_murid');

                    $wali = WaliMurid::create([
                        'user_id' => $user->id,
                        'no_hp' => $noHp,
                        'alamat' => '-', // dilengkapi kemudian
                    ]);

                    // Hubungkan siswa sebagai anak (hubungan default wali, primary)
                    $wali->siswa()->attach($siswa->id, [
                        'hubungan' => 'wali',
                        'is_primary' => true,
                    ]);
                });
            }
            $dibuat++;
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        if ($dryRun) {
            $this->info("Dry-run selesai. {$dibuat} akun akan dibuat kalau dijalankan tanpa --dry-run.");
        } else {
            $this->info("Selesai. {$dibuat} akun wali berhasil dibuat.");
            $this->line('Password awal setiap akun = nomor HP (atau 00000000000 kalau kosong).');
            $this->line('Email login: {NIS}@wali.smkn9malang.sch.id');
        }

        return self::SUCCESS;
    }
}