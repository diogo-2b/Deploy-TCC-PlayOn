<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Equipe extends Model
{

    use HasFactory;


    protected $fillable = [
        'nome',
        'descricao',
        'imagem',
        'administrador',
        'tipo'
    ];

    protected $casts = [
        'tipo' => 'boolean',
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'administrador', 'id');
    }

    public function membros(): HasMany
    {
        return $this->hasMany(Participantes_Equipes::class, 'id_equipe', 'id');
    }

    public function competicoes(): HasMany
    {
        return $this->hasMany(Participantes_Competicoes::class, 'id_participante', 'id')
            ->where('tipo_participante', 'equipe');
    }
}
