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
        Schema::create('pasal_tatib', function (Blueprint $table) {
            $table->id();
            $table->string('kode', 20)->unique();   // "PASAL_1", "PASAL_2", dst
            $table->string('nama', 150);            // "Kerajinan", "Kerapian", dst
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
        Schema::dropIfExists('pasal_tatib');
    }
};
