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
        Schema::create('presensi_sholat', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sesi_sholat_id')->constrained('sesi_sholat')->cascadeOnDelete();
            $table->foreignId('siswa_id')->constrained('siswa');
            $table->timestamp('waktu_scan')->useCurrent();
            $table->foreignId('petugas_id')->constrained('users'); // guru yang scan
            $table->enum('metode', ['scan', 'manual'])->default('scan');
            $table->timestamps();

            $table->unique(['sesi_sholat_id', 'siswa_id']); // cegah dobel
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('presensi_sholat');
    }
};
