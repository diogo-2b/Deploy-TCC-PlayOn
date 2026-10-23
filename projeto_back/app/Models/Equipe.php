<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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

    protected $appends = ['imagem_url'];

    public function getImagemUrlAttribute(): string
    {
        if (empty($this->imagem) || $this->imagem === 'foto.png') {
            return config('app.default_image_url');
        }

        return Str::startsWith($this->imagem, ['http://', 'https://'])
            ? $this->imagem
            : asset(Storage::url('equipes/' . $this->imagem));
    }

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
