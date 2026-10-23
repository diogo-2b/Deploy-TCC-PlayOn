<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Builder;

class Competicao extends Model
{

    use HasFactory;

    protected $table = 'competicoes';

    protected $fillable = [
        'nome',
        'descricao',
        'imagem',
        'dono',
        'tipo',
        'inscricao',
        'jogo_id',
        'data_encerramento',
    ];

    protected $casts = [
        'tipo' => 'boolean',
        'inscricao' => 'boolean',
        'data_encerramento' => 'date:Y-m-d',
    ];

    protected $appends = ['imagem_url'];

    public function getImagemUrlAttribute(): string
    {
        if (empty($this->imagem) || $this->imagem === 'foto.png') {
            return config('app.default_image_url');
        }

        return Str::startsWith($this->imagem, ['http://', 'https://'])
            ? $this->imagem
            : asset(Storage::url('competicoes/' . $this->imagem));
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'dono', 'id');
    }

    public function participantes(): HasMany
    {
        return $this->hasMany(Participantes_Competicoes::class, 'id_competicao', 'id');
    }

    /**
     * Retorna participantes (usuários) da competição
     */
    public function usuariosParticipantes(): HasMany
    {
        return $this->hasMany(Participantes_Competicoes::class, 'id_competicao', 'id')
            ->where('tipo_participante', 'usuario');
    }

    /**
     * Retorna participantes (equipes) da competição
     */
    public function equipasParticipantes(): HasMany
    {
        return $this->hasMany(Participantes_Competicoes::class, 'id_competicao', 'id')
            ->where('tipo_participante', 'equipe');
    }

    public function jogo(): BelongsTo
    {
        return $this->belongsTo(Jogo::class, 'jogo_id');
    }

    public function scopeAtivas(Builder $query): Builder
    {
        return $query->whereDate('data_encerramento', '>=', now(config('app.timezone'))->toDateString());
    }

    public function isEncerrada(): bool
    {
        return $this->data_encerramento !== null
            && $this->data_encerramento->toDateString() < now(config('app.timezone'))->toDateString();
    }


}
