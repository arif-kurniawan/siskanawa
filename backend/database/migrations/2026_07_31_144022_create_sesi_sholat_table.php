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
        Schema::create('sesi_sholat', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal')->unique(); // satu sesi per hari
            $table->time('waktu_buka')->nullable();
            $table->time('waktu_tutup')->nullable();
            $table->foreignId('dibuka_oleh')->constrained('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sesi_sholat');
    }
};
