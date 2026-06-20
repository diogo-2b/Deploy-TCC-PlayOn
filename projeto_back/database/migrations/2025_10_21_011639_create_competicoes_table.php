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
        Schema::create('competicoes', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->text('descricao');
            $table->string('imagem')->default('foto.png');
            $table->integer('dono');
            $table->boolean('tipo')->default(false); //false é publico e true é privado
            $table->boolean('inscricao')->default(false); //false é pessoa e true é público
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('competicoes');
    }
};
