<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sessoes', function (Blueprint $table) {
            $table->id();

            $table->foreignId('criador_id')
                ->constrained('usuarios')
                ->cascadeOnDelete();

            $table->string('titulo');

            $table->text('descricao')->nullable();

            $table->string('jogo');

            $table->integer('max_jogadores')->default(5);

            $table->enum('status', [
                'aberta',
                'fechada',
                'encerrada'
            ])->default('aberta');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessoes');
    }
};
