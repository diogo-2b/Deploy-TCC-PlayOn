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
        Schema::create('participantes_competicoes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_competicao')->constrained('competicoes')->onDelete('cascade');
            $table->unsignedBigInteger('id_participante');
            $table->enum('tipo_participante', ['usuario', 'equipe']);
            $table->boolean('aprovado')->default(false);
            $table->timestamps();

            $table->unique(['id_competicao', 'id_participante', 'tipo_participante']);

            // Não usamos foreign key para id_participante pois pode ser usuario ou equipe
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('participantes_competicoes');
    }
};
