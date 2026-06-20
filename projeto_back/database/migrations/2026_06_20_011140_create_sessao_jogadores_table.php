<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sessao_jogadores', function (Blueprint $table) {
            $table->id();

            $table->foreignId('sessao_id')
                ->constrained('sessoes')
                ->cascadeOnDelete();

            $table->foreignId('usuario_id')
                ->constrained('usuarios')
                ->cascadeOnDelete();

            $table->timestamps();

            $table->unique([
                'sessao_id',
                'usuario_id'
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessao_jogadores');
    }
};
