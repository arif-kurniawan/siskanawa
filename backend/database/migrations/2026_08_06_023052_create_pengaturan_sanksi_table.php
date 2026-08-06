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
        Schema::create('pengaturan_sanksi', function (Blueprint $table) {
            $table->id();
            $table->string('nama', 100);                    // "SP1", "SP2", "Peringatan 1", dst
            $table->unsignedSmallInteger('poin_min');       // ambang bawah
            $table->unsignedSmallInteger('poin_max')->nullable(); // ambang atas (null = tak terbatas)
            $table->text('tindakan');                       // deskripsi sanksi
            $table->unsignedTinyInteger('level')->default(1); // urutan tingkat keparahan
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengaturan_sanksi');
    }
};
