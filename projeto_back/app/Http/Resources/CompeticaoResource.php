<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CompeticaoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $base = parent::toArray($request);

        $imagemUrl = null;
        if (!empty($this->imagem)) {
            $imagemUrl = asset(Storage::url('competicoes/' . $this->imagem));
        } else {
            $imagemUrl = asset('imagens/foto.png');
        }

        return array_merge($base, [
            'codigo' => $this->id,
            'dono' => $this->dono,
            'imagem_url' => $imagemUrl,
            'media' => $this->whenLoaded('media', function () {
                return $this->media->map(function ($media) {
                    if (Str::contains($media->source, 'http')) {
                        return $media->source;
                    }

                    return asset(Storage::url('competicoes/' . $media->source));
                });
            }),
        ]);
    }
}
