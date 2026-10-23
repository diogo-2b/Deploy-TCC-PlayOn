<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContaSteam extends Model
{
    protected $table = 'Conta_Steam';

    protected $fillable = [
        'usuario_id',
        'steam_id',
        'personaname',
        'avatar',
        'profile_url',
        'personastate',
        'last_synced_at',
    ];

    protected $casts = [
        'personastate' => 'integer',
        'last_synced_at' => 'datetime',
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}
