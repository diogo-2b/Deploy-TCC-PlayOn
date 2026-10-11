<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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
        'inscricao'
    ];

    protected $casts = [
        'tipo' => 'boolean',
        'inscricao' => 'boolean',
    ];

    protected $appends = ['imagem_url'];

    public function getImagemUrlAttribute(): string
    {
        if (empty($this->imagem)) {
            return asset('imagens/foto.png');
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
}
