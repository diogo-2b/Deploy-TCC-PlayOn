<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Jogo extends Model
{
    use HasFactory;

    protected $table = 'jogos';

    protected $fillable = [
        'igdb_id',
        'nome',
        'capa_url',
    ];

    public function competicoes(): HasMany
    {
        return $this->hasMany(Competicao::class, 'jogo_id');
    }

    public function sessoes(): HasMany
    {
        return $this->hasMany(Sessao::class, 'jogo_id');
    }
}
