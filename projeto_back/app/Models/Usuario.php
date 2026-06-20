<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Usuario extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $fillable = [
        'apelido',
        'nome',
        'email',
        'password',
        'imagem',
        'is_admin',
        'email_verified_at',
        'firebase_uid',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_admin' => 'boolean',
    ];

    public function equipes(): HasMany
    {
        return $this->hasMany(Equipe::class, 'administrador', 'id');
    }

    public function minhasEquipes(): HasMany
    {
        return $this->hasMany(Participantes_Equipes::class, 'id_usuario', 'id');
    }

    public function competicoes(): HasMany
    {
        return $this->hasMany(Competicao::class, 'dono', 'id');
    }

    public function minhasCompeticoes(): HasMany
    {
        return $this->hasMany(Participantes_Competicoes::class, 'id_participante', 'id')
            ->where('tipo_participante', 'usuario');
    }
}
