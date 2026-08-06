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
        Schema::create('jenis_pelanggaran', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pasal_tatib_id')->constrained('pasal_tatib');
            $table->foreignId('jenis_tatib_id')->constrained('jenis_tatib');
            $table->text('nama');                   // deskripsi pelanggaran
            $table->text('keterangan')->nullable(); // catatan tambahan (mis. definisi)
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jenis_pelanggaran');
    }
};
