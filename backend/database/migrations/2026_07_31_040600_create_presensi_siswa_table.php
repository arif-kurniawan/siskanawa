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
        Schema::create('presensi_siswa', function (Blueprint $table) {
            $table->id();
            $table->foreignId('jurnal_mengajar_id')->constrained('jurnal_mengajar')->cascadeOnDelete();
            $table->foreignId('siswa_id')->constrained('siswa');
            $table->enum('status', ['hadir', 'izin', 'sakit', 'alpa', 'dispensasi'])->default('hadir');
            $table->string('keterangan')->nullable();
            $table->timestamps();

            // Satu siswa hanya satu presensi per jurnal
            $table->unique(['jurnal_mengajar_id', 'siswa_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('presensi_siswa');
    }
};
