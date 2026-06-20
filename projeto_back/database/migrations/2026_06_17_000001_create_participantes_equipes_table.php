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
        Schema::create('participantes_equipes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_equipe')->constrained('equipes')->onDelete('cascade');
            $table->foreignId('id_usuario')->constrained('usuarios')->onDelete('cascade');
            $table->boolean('aprovado')->default(false);
            $table->timestamps();

            $table->unique(['id_equipe', 'id_usuario']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('participantes_equipes');
    }
};
