<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('Conta_Steam', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')
                ->unique()
                ->constrained('usuarios')
                ->cascadeOnDelete();
            $table->string('steam_id', 32)->unique();
            $table->string('personaname')->nullable();
            $table->string('avatar')->nullable();
            $table->string('profile_url')->nullable();
            $table->unsignedTinyInteger('personastate')->nullable();
            $table->timestamp('last_synced_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('Conta_Steam');
    }
};
