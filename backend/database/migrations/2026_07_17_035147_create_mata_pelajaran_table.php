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
        Schema::create('mata_pelajaran', function (Blueprint $table) {
            $table->id();
            $table->string('kode', 20)->unique();
            $table->string('nama', 100);
            $table->enum('kategori', ['umum', 'kejuruan', 'muatan_lokal']);
            $table->foreignId('jurusan_id')->nullable()->constrained('jurusan')->nullOnDelete(); 
            // null untuk mapel umum, isi untuk mapel kejuruan spesifik jurusan
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mata_pelajaran');
    }
};
