<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Participantes_Competicoes extends Model
{
    use HasFactory;

    protected $table = 'participantes_competicoes';

    protected $fillable = [
        'id_competicao',
        'id_participante',
        'tipo_participante',
        'aprovado'
    ];

    protected $casts = [
        'aprovado' => 'boolean',
    ];

    public function participante(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_participante', 'id');
    }

    public function equipe(): BelongsTo
    {
        return $this->belongsTo(Equipe::class, 'id_participante', 'id');
    }

    public function competicao(): BelongsTo
    {
        return $this->belongsTo(Competicao::class, 'id_competicao', 'id');
    }
}
