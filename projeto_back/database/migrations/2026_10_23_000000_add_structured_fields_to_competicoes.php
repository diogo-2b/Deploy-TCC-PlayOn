<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('competicoes', function (Blueprint $table) {
            $table->string('modo')->default('personalizado');
            $table->string('formato')->nullable();
            $table->unsignedSmallInteger('quantidade_participantes')->nullable();
            $table->unsignedInteger('numero_rodadas')->nullable();
            $table->string('primeiro_lugar_tipo')->nullable();
            $table->unsignedBigInteger('primeiro_lugar_id')->nullable();
            $table->string('segundo_lugar_tipo')->nullable();
            $table->unsignedBigInteger('segundo_lugar_id')->nullable();
            $table->string('terceiro_lugar_tipo')->nullable();
            $table->unsignedBigInteger('terceiro_lugar_id')->nullable();
        });

        Schema::create('competicao_partidas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('competicao_id')->constrained('competicoes')->cascadeOnDelete();
            $table->enum('fase', ['oitavas', 'quartas', 'semifinais', 'final', 'terceiro_lugar', 'rodada']);
            $table->unsignedInteger('rodada')->default(0);
            $table->unsignedSmallInteger('numero_partida');
            $table->enum('participante_a_tipo', ['usuario', 'equipe'])->nullable();
            $table->unsignedBigInteger('participante_a_id')->nullable();
            $table->enum('participante_b_tipo', ['usuario', 'equipe'])->nullable();
            $table->unsignedBigInteger('participante_b_id')->nullable();
            $table->enum('resultado', ['a', 'b', 'empate'])->nullable();
            $table->timestamps();

            $table->unique(
                ['competicao_id', 'fase', 'rodada', 'numero_partida'],
                'competicao_partidas_slot_unique'
            );
            $table->index(['competicao_id', 'fase', 'rodada'], 'competicao_partidas_lookup_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('competicao_partidas');

        Schema::table('competicoes', function (Blueprint $table) {
            $table->dropColumn([
                'modo',
                'formato',
                'quantidade_participantes',
                'numero_rodadas',
                'primeiro_lugar_tipo',
                'primeiro_lugar_id',
                'segundo_lugar_tipo',
                'segundo_lugar_id',
                'terceiro_lugar_tipo',
                'terceiro_lugar_id',
            ]);
        });
    }
};
