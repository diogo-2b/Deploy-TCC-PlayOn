<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Participantes_Equipes extends Model
{
    use HasFactory;

    protected $table = 'participantes_equipes';

    protected $fillable = [
        'id_equipe',
        'id_usuario',
        'aprovado'
    ];

    protected $casts = [
        'aprovado' => 'boolean',
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id');
    }

    public function equipe(): BelongsTo
    {
        return $this->belongsTo(Equipe::class, 'id_equipe', 'id');
    }
}
