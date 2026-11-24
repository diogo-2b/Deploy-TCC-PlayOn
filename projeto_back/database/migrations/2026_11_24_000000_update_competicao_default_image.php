<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const DEFAULT_COMPETITION_IMAGE_URL = 'https://res.cloudinary.com/ddpuzfnbd/image/upload/v1795490150/playon/competicoes/27a69830-8495-490a-ba21-9ca5ae0c7c29.png';
    private const PREVIOUS_DEFAULT_IMAGE_URL = 'https://res.cloudinary.com/ddpuzfnbd/image/upload/v1792605154/playon/equipes/22463a4f-6b4a-4864-971a-ccebc628ec7e.png';

    public function up(): void
    {
        Schema::table('competicoes', function (Blueprint $table) {
            $table->string('imagem')
                ->default(self::DEFAULT_COMPETITION_IMAGE_URL)
                ->change();
        });
    }

    public function down(): void
    {
        Schema::table('competicoes', function (Blueprint $table) {
            $table->string('imagem')
                ->default(self::PREVIOUS_DEFAULT_IMAGE_URL)
                ->change();
        });
    }
};
