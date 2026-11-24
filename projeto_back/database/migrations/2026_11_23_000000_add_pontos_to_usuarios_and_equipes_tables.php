<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            $table->unsignedInteger('pontos')->nullable()->default(0);
        });

        Schema::table('equipes', function (Blueprint $table) {
            $table->unsignedInteger('pontos')->nullable()->default(0);
        });
    }

    public function down(): void
    {
        Schema::table('equipes', function (Blueprint $table) {
            $table->dropColumn('pontos');
        });

        Schema::table('usuarios', function (Blueprint $table) {
            $table->dropColumn('pontos');
        });
    }
};
