<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('denuncias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_usuario')
                ->constrained('usuarios')
                ->restrictOnDelete();
            $table->string('tipo', 20);
            $table->unsignedBigInteger('id_denunciado');
            $table->text('mensagem');
            $table->timestamps();

            $table->index(['tipo', 'id_denunciado']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('denuncias');
    }
};
