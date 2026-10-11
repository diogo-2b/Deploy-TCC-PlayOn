
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('competicoes', function (Blueprint $table) {
            $table->foreignId('jogo_id')
                ->nullable()
                ->constrained('jogos')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('competicoes', function (Blueprint $table) {
            $table->dropForeign(['jogo_id']);
            $table->dropColumn('jogo_id');
        });
    }
};
