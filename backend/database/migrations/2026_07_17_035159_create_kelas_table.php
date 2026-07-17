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
        Schema::create('kelas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('jurusan_id')->constrained('jurusan');
            $table->foreignId('tahun_ajaran_id')->constrained('tahun_ajaran');
            $table->enum('tingkat', ['X', 'XI', 'XII']);
            $table->string('nama_rombel', 20); // contoh: "1", "2", atau "A", "B"
            $table->foreignId('wali_kelas_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            
            $table->unique(['jurusan_id', 'tahun_ajaran_id', 'tingkat', 'nama_rombel']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kelas');
    }
};
