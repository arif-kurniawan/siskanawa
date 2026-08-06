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
        Schema::create('catatan_pelanggaran', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')->constrained('siswa');
            $table->foreignId('jenis_pelanggaran_id')->nullable()->constrained('jenis_pelanggaran');
            $table->foreignId('tahun_ajaran_id')->constrained('tahun_ajaran');
            $table->foreignId('dicatat_oleh')->constrained('users'); // guru pencatat

            $table->enum('semester', ['ganjil', 'genap']);
            $table->date('tanggal');
            $table->smallInteger('poin'); // snapshot; bisa negatif untuk penghapusan poin
            $table->enum('tipe', ['pelanggaran', 'penghapusan'])->default('pelanggaran');
            $table->text('keterangan')->nullable();

            $table->timestamps();

            $table->index(['siswa_id', 'tahun_ajaran_id', 'semester']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('catatan_pelanggaran');
    }
};
