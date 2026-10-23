<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UsuarioResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        if (!empty($this->imagem) && $this->imagem !== 'foto.png') {
            $imagemUrl = Str::startsWith($this->imagem, ['http://', 'https://'])
                ? $this->imagem
                : asset(Storage::url('usuarios/' . $this->imagem));
        } else {
            $imagemUrl = config('app.default_image_url');
        }

        return [
            'id' => $this->id,
            'nome' => $this->nome ?? $this->name ?? null,
            'apelido' => $this->apelido ?? null,
            'email' => $this->email ?? null,
            'email_verified_at' => $this->email_verified_at ?? null,
            'firebase_uid' => $this->firebase_uid ?? null,
            'steam' => $this->contaSteam ? [
                'id' => $this->contaSteam->steam_id,
                'personaname' => $this->contaSteam->personaname,
                'avatar' => $this->contaSteam->avatar,
                'profile_url' => $this->contaSteam->profile_url,
                'personastate' => $this->contaSteam->personastate,
                'last_synced_at' => $this->contaSteam->last_synced_at,
            ] : null,
            'is_admin' => (bool) $this->is_admin,
            'imagem' => $this->imagem ?? null,
            'imagem_url' => $imagemUrl,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
