<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tindak_lanjut_kasus', function (Blueprint $table) {
            $table->string('foto_path')->nullable()->after('isi');
            $table->string('dokumen_path')->nullable()->after('foto_path');
        });
    }

    public function down(): void
    {
        Schema::table('tindak_lanjut_kasus', function (Blueprint $table) {
            $table->dropColumn(['foto_path', 'dokumen_path']);
        });
    }
};
