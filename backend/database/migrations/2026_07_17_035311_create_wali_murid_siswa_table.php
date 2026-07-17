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
        Schema::create('wali_murid_siswa', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wali_murid_id')->constrained('wali_murid')->cascadeOnDelete();
            $table->foreignId('siswa_id')->constrained('siswa')->cascadeOnDelete();
            $table->enum('hubungan', ['ayah', 'ibu', 'wali']);
            $table->boolean('is_primary')->default(false); // wali utama
            $table->timestamps();
            
            $table->unique(['wali_murid_id', 'siswa_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wali_murid_siswa');
    }
};
