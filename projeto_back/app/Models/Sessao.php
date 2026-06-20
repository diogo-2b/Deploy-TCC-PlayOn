<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Sessao extends Model
{
    use HasFactory;

    protected $table = 'sessoes';

    protected $fillable = [
        'criador_id',
        'titulo',
        'descricao',
        'jogo',
        'max_jogadores',
        'status'
    ];

    protected $appends = [
        'status_label',
        'lotacao',
    ];

    public function criador(): BelongsTo
    {
        return $this->belongsTo(
            Usuario::class,
            'criador_id',
            'id'
        );
    }

    public function jogadores(): BelongsToMany
    {
        return $this->belongsToMany(
            Usuario::class,
            'sessao_jogadores',
            'sessao_id',
            'usuario_id'
        )->withTimestamps();
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'fechada' => 'Fechada',
            'encerrada' => 'Encerrada',
            default => 'Aberta',
        };
    }

    public function getLotacaoAttribute(): string
    {
        return $this->jogadores()->count() . '/' . $this->max_jogadores;
    }
}
