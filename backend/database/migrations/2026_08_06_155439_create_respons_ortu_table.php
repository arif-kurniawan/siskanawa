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
        Schema::create('respons_ortu', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tindak_lanjut_id')->constrained('tindak_lanjut_kasus')->cascadeOnDelete();
            $table->foreignId('wali_murid_id')->constrained('wali_murid');
            $table->text('isi');
            $table->timestamps();

            $table->index('tindak_lanjut_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('respons_ortu');
    }
};
