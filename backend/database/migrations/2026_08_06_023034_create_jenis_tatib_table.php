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
        Schema::create('jenis_tatib', function (Blueprint $table) {
            $table->id();
            $table->string('kode', 20)->unique();   // "HARIAN", "KHUSUS", "BERAT"
            $table->string('nama', 50);             // "Harian", "Khusus", "Berat"
            $table->unsignedSmallInteger('poin');   // 1, 3, 10 — BISA DIUBAH
            $table->unsignedTinyInteger('urutan')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jenis_tatib');
    }
};
