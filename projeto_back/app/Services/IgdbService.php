<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class IgdbService
{
    private function getAccessToken(): string
    {
        return Cache::remember(
            'igdb_access_token',
            now()->addMinutes(50),
            function () {
                $clientId = config('services.igdb.client_id');
                $clientSecret = config('services.igdb.client_secret');

                if (!$clientId || !$clientSecret) {
                    throw new RuntimeException(
                        'Credenciais do IGDB não configuradas.'
                    );
                }

                $response = Http::asForm()
                    ->post(
                        'https://id.twitch.tv/oauth2/token',
                        [
                            'client_id' => $clientId,
                            'client_secret' => $clientSecret,
                            'grant_type' => 'client_credentials',
                        ]
                    );

                $response->throw();

                $token = $response->json('access_token');

                if (!$token) {
                    throw new RuntimeException(
                        'A Twitch não retornou um token de acesso.'
                    );
                }

                return $token;
            }
        );
    }

    public function searchGames(string $search): array
    {
        $clientId = config('services.igdb.client_id');

        if (!$clientId) {
            throw new RuntimeException(
                'Client ID do IGDB não configurado.'
            );
        }

        $query = 'fields id, name, cover.image_id, platforms.name; '
            . 'search "' . addcslashes($search, "\\\"") . '"; '
            . 'limit 10;';

        $response = Http::withHeaders([
            'Client-ID' => $clientId,
            'Authorization' => 'Bearer ' . $this->getAccessToken(),
            'Accept' => 'application/json',
        ])
            ->withBody($query, 'text/plain')
            ->post('https://api.igdb.com/v4/games');

        $response->throw();

        return collect($response->json())
            ->map(function ($game) {
                $imageId = data_get($game, 'cover.image_id');

                return [
                    'igdb_id' => $game['id'],
                    'nome' => $game['name'],
                    'capa_url' => $imageId
                        ? "https://images.igdb.com/igdb/image/upload/t_cover_big/{$imageId}.jpg"
                        : null,
                    'plataformas' => collect(
                        $game['platforms'] ?? []
                    )->pluck('name')->values(),
                ];
            })
            ->values()
            ->all();
    }
}
