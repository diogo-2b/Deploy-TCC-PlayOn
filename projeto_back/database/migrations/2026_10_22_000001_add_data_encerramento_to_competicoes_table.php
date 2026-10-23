<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('competicoes', function (Blueprint $table) {
            $table->date('data_encerramento')->nullable();
        });

        // Competições antigas recebem uma data conservadora baseada na criação.
        // A coluna só se torna obrigatória depois desse preenchimento.
        DB::statement(
            "UPDATE competicoes SET data_encerramento = DATE(created_at) WHERE data_encerramento IS NULL"
        );

        Schema::table('competicoes', function (Blueprint $table) {
            $table->date('data_encerramento')->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('competicoes', function (Blueprint $table) {
            $table->dropColumn('data_encerramento');
        });
    }
};
