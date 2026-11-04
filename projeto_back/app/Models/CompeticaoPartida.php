<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompeticaoPartida extends Model
{
    protected $table = 'competicao_partidas';

    protected $fillable = [
        'competicao_id',
        'fase',
        'rodada',
        'numero_partida',
        'participante_a_tipo',
        'participante_a_id',
        'participante_b_tipo',
        'participante_b_id',
        'resultado',
    ];

    public function competicao(): BelongsTo
    {
        return $this->belongsTo(Competicao::class, 'competicao_id');
    }
}
