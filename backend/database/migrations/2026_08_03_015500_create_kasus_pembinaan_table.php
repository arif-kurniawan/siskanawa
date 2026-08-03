<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('kasus_pembinaan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')->constrained('siswa');
            $table->enum('kategori', ['kehadiran', 'akademik', 'etika', 'poin_tatib', 'lainnya']);
            $table->enum('tingkat', ['ringan', 'sedang', 'berat']);
            $table->string('judul');
            $table->text('deskripsi');
            $table->enum('status', ['baru', 'ditangani', 'dipantau', 'selesai'])->default('baru');

            // Eskalasi berjenjang: level penanganan saat ini
            $table->enum('level_penanganan', ['guru', 'wali_kelas', 'bk', 'kepala_sekolah'])->default('wali_kelas');

            $table->foreignId('pelapor_id')->constrained('users');
            $table->foreignId('penanggung_jawab_id')->nullable()->constrained('users');
            $table->foreignId('tahun_ajaran_id')->constrained('tahun_ajaran');
            $table->boolean('is_rahasia')->default(false); // hanya BK + kepsek
            $table->timestamp('selesai_at')->nullable();
            $table->timestamps();

            $table->index(['siswa_id', 'status']);
            $table->index('level_penanganan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kasus_pembinaan');
    }
};
