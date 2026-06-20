<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EquipeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $imagemUrl = null;
        if (!empty($this->imagem)) {
            $imagemUrl = asset(\Illuminate\Support\Facades\Storage::url('equipes/' . $this->imagem));
        } else {
            // fallback para imagem padrão embutida no public
            $imagemUrl = asset('imagens/foto.png');
        }

        return [
            'id' => $this->id,
            'codigo' => $this->id,
            'nome' => $this->nome,
            'descricao' => $this->descricao ?? null,
            'imagem' => $this->imagem ?? null,
            'imagem_url' => $imagemUrl,
            'administrador' => $this->administrador,
            'tipo' => (bool) $this->tipo,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
