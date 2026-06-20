<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class UsuarioResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        if (!empty($this->imagem)) {
            $imagemUrl = asset(Storage::url('usuarios/' . $this->imagem));
        } else {
            $imagemUrl = asset('imagens/foto.png');
        }

        return [
            'id' => $this->id,
            'nome' => $this->nome ?? $this->name ?? null,
            'apelido' => $this->apelido ?? null,
            'email' => $this->email ?? null,
            'email_verified_at' => $this->email_verified_at ?? null,
            'firebase_uid' => $this->firebase_uid ?? null,
            'imagem' => $this->imagem ?? null,
            'imagem_url' => $imagemUrl,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
