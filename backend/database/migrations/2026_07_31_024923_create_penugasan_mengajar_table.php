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
        Schema::create('penugasan_mengajar', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guru_id')->constrained('users');
            $table->foreignId('mata_pelajaran_id')->constrained('mata_pelajaran');
            $table->foreignId('kelas_id')->constrained('kelas');
            $table->foreignId('tahun_ajaran_id')->constrained('tahun_ajaran');
            $table->timestamps();

            // Satu guru tidak boleh punya penugasan ganda untuk mapel+kelas yang sama
            $table->unique(['guru_id', 'mata_pelajaran_id', 'kelas_id', 'tahun_ajaran_id'], 'unik_penugasan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('penugasan_mengajar');
    }
};
