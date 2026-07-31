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
        Schema::create('jurnal_mengajar', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kelas_id')->constrained('kelas');
            $table->foreignId('mata_pelajaran_id')->constrained('mata_pelajaran');
            $table->foreignId('guru_id')->constrained('users'); // guru = user pengajar
            $table->date('tanggal');
            $table->unsignedTinyInteger('jam_ke');
            $table->text('materi');
            $table->text('catatan')->nullable();
            $table->timestamps();

            // Cegah duplikat: satu kelas, jam ke, tanggal hanya satu jurnal
            $table->unique(['kelas_id', 'tanggal', 'jam_ke'], 'unik_jurnal_per_jam');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jurnal_mengajar');
    }
};
