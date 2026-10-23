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
        if (!empty($this->imagem) && $this->imagem !== 'foto.png') {
            $imagemUrl = Str::startsWith($this->imagem, ['http://', 'https://'])
                ? $this->imagem
                : asset(Storage::url('competicoes/' . $this->imagem));
        } else {
            $imagemUrl = config('app.default_image_url');
        }

        return array_merge($base, [
            'codigo' => $this->id,
            'dono' => $this->dono,
            'data_encerramento' => $this->data_encerramento?->format('Y-m-d'),
            'encerrada' => $this->isEncerrada(),
            'imagem_url' => $imagemUrl,
            'jogo' => $this->whenLoaded('jogo'),
            'media' => $this->whenLoaded('media', function () {
                return $this->media->map(function ($media) {
                    if (Str::startsWith($media->source, ['http://', 'https://'])) {
                        return $media->source;
                    }

                    return asset(Storage::url('competicoes/' . $media->source));
                });
            }),
        ]);
    }
}
