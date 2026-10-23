<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CompeticaoHistoricoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'codigo' => $this->id,
            'nome' => $this->nome,
            'dono' => $this->dono,
            'data_encerramento' => $this->data_encerramento?->format('Y-m-d'),
            'encerrada' => true,
            'historico_resumido' => true,
        ];
    }
}
