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
        Schema::create('tindak_lanjut_kasus', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kasus_pembinaan_id')->constrained('kasus_pembinaan')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users'); // siapa mencatat
            $table->enum('jenis', ['catatan', 'komunikasi_ortu', 'eskalasi', 'perubahan_status']);
            $table->text('isi');
            $table->boolean('ditujukan_ke_ortu')->default(false); // muncul di buku penghubung ortu
            // Untuk eskalasi: catat perpindahan level
            $table->string('level_dari')->nullable();
            $table->string('level_ke')->nullable();
            $table->timestamps();

            $table->index('kasus_pembinaan_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tindak_lanjut_kasus');
    }
};
