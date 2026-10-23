<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class SteamService
{
    public function authorizationUrl(string $state): string
    {
        $returnTo = config('services.steam.return_to') . '?state=' . urlencode($state);

        return 'https://steamcommunity.com/openid/login?' . http_build_query([
            'openid.ns' => 'http://specs.openid.net/auth/2.0',
            'openid.mode' => 'checkid_setup',
            'openid.return_to' => $returnTo,
            'openid.realm' => config('services.steam.realm'),
            'openid.identity' => 'http://specs.openid.net/auth/2.0/identifier_select',
            'openid.claimed_id' => 'http://specs.openid.net/auth/2.0/identifier_select',
            'state' => $state,
        ]);
    }

    public function validateOpenId(array $parameters, string $state): string
    {
        $getParameter = static function (array $source, string $name): mixed {
            return $source['openid_' . str_replace('.', '_', $name)]
                ?? $source['openid.' . $name]
                ?? null;
        };

        $claimedId = $getParameter($parameters, 'claimed_id');
        $identity = $getParameter($parameters, 'identity');

        if ($getParameter($parameters, 'mode') === 'cancel') {
            throw new RuntimeException('A autenticação Steam foi cancelada.');
        }

        if ($getParameter($parameters, 'ns') !== 'http://specs.openid.net/auth/2.0') {
            throw new RuntimeException('Resposta OpenID inválida: namespace.');
        }

        if ($getParameter($parameters, 'mode') !== 'id_res') {
            throw new RuntimeException('Resposta OpenID inválida: modo.');
        }

        if (
            !is_string($claimedId) ||
            !is_string($identity) ||
            $claimedId !== $identity
        ) {
            throw new RuntimeException('Resposta OpenID inválida: identidade.');
        }

        if (!preg_match('/^https?:\/\/steamcommunity\.com\/openid\/id\/(\d{17})$/', $claimedId, $matches)) {
            throw new RuntimeException('Resposta OpenID inválida: Steam ID.');
        }

        $returnTo = $getParameter($parameters, 'return_to');
        $configuredReturnTo = config('services.steam.return_to');
        $returnToParts = is_string($returnTo) ? parse_url($returnTo) : false;
        $configuredParts = parse_url($configuredReturnTo);
        $returnToQuery = is_array($returnToParts)
            ? parse_url($returnTo, PHP_URL_QUERY)
            : null;
        parse_str(is_string($returnToQuery) ? $returnToQuery : '', $returnToParameters);

        if (
            !is_array($returnToParts) ||
            !is_array($configuredParts) ||
            ($returnToParts['scheme'] ?? null) !== ($configuredParts['scheme'] ?? null) ||
            ($returnToParts['host'] ?? null) !== ($configuredParts['host'] ?? null) ||
            ($returnToParts['port'] ?? null) !== ($configuredParts['port'] ?? null) ||
            ($returnToParts['path'] ?? null) !== ($configuredParts['path'] ?? null) ||
            ($returnToParameters['state'] ?? null) !== $state
        ) {
            throw new RuntimeException('Callback OpenID inválido: retorno.');
        }

        $signed = $getParameter($parameters, 'signed');
        if (!is_string($signed) || $signed === '') {
            throw new RuntimeException('Resposta OpenID inválida: campos assinados.');
        }

        $signature = $getParameter($parameters, 'sig');
        if (!is_string($signature) || $signature === '') {
            throw new RuntimeException('Resposta OpenID inválida: assinatura ausente.');
        }

        $verificationParameters = ['openid.mode' => 'check_authentication'];
        foreach ($parameters as $key => $value) {
            if (!str_starts_with($key, 'openid_') || $key === 'openid_mode') {
                continue;
            }

            if (!is_scalar($value)) {
                throw new RuntimeException('Resposta OpenID inválida: parâmetro inválido.');
            }

            $field = substr($key, 7);
            $verificationParameters['openid.' . $field] = (string) $value;
        }

        foreach (explode(',', $signed) as $field) {
            if (!array_key_exists('openid.' . trim($field), $verificationParameters)) {
                throw new RuntimeException('Resposta OpenID inválida: campo assinado ausente.');
            }
        }

        $verificationEndpoint = 'https://steamcommunity.com/openid/login';
        $reportedEndpoint = $getParameter($parameters, 'op_endpoint');
        if (
            is_string($reportedEndpoint) &&
            parse_url($reportedEndpoint, PHP_URL_SCHEME) === 'https' &&
            parse_url($reportedEndpoint, PHP_URL_HOST) === 'steamcommunity.com' &&
            parse_url($reportedEndpoint, PHP_URL_PATH) === '/openid/login'
        ) {
            $verificationEndpoint = $reportedEndpoint;
        }

        try {
            $response = $this->httpClient()
                ->asForm()
                ->timeout(10)
                ->post($verificationEndpoint, $verificationParameters);
        } catch (ConnectionException $exception) {
            Log::warning('Falha de conexão ao validar OpenID Steam.', [
                'exception' => $exception::class,
            ]);
            throw new RuntimeException('Não foi possível conectar à Steam para validar a conta.', 0, $exception);
        }

        $responseBody = $response->body();
        $isValid = preg_match('/\bis_valid\s*:\s*true\b/i', $responseBody) === 1;
        if (!$response->successful() || !$isValid) {
            Log::warning('Steam rejeitou a validação OpenID.', [
                'http_status' => $response->status(),
                'response_length' => strlen($responseBody),
                'response_hash' => hash('sha256', $responseBody),
            ]);
            throw new RuntimeException('Não foi possível validar a conta Steam.');
        }

        return $matches[1];
    }

    public function playerSummary(string $steamId): array
    {
        $apiKey = config('services.steam.api_key');
        if (!$apiKey) {
            throw new RuntimeException('A integração Steam não está configurada.');
        }

        try {
            $response = $this->httpClient()
                ->acceptJson()
                ->timeout(10)
                ->get('https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/', [
                    'key' => $apiKey,
                    'steamids' => $steamId,
                ]);
        } catch (ConnectionException $exception) {
            throw new RuntimeException('Não foi possível conectar à Steam para consultar os dados públicos.', 0, $exception);
        }

        $player = $response->json('response.players.0');
        if (!$response->successful() || !is_array($player)) {
            throw new RuntimeException('Os dados públicos desta conta Steam não estão disponíveis.');
        }

        return [
            'steam_id' => $steamId,
            'steam_personaname' => $player['personaname'] ?? null,
            'steam_avatar' => $player['avatarfull'] ?? $player['avatarmedium'] ?? $player['avatar'] ?? null,
            'steam_profile_url' => $player['profileurl'] ?? null,
            'steam_personastate' => isset($player['personastate']) ? (int) $player['personastate'] : null,
            'steam_last_synced_at' => now(),
        ];
    }

    public function recentlyPlayedGames(string $steamId): array
    {
        $minutes = max(1, (int) config('services.steam.recent_cache_minutes', 10));

        return Cache::remember(
            'steam:recently-played:' . $steamId,
            now()->addMinutes($minutes),
            fn (): array => $this->fetchRecentlyPlayedGames($steamId),
        );
    }

    private function fetchRecentlyPlayedGames(string $steamId): array
    {
        $apiKey = config('services.steam.api_key');
        if (!$apiKey) {
            throw new RuntimeException('A integração Steam não está configurada.');
        }

        try {
            $response = $this->httpClient()
                ->acceptJson()
                ->timeout(10)
                ->get('https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/', [
                    'key' => $apiKey,
                    'steamid' => $steamId,
                ]);
        } catch (ConnectionException $exception) {
            throw new RuntimeException('Não foi possível conectar à Steam para consultar os jogos recentes.', 0, $exception);
        }

        if (!$response->successful()) {
            throw new RuntimeException('A Steam não disponibilizou os jogos recentes desta conta.');
        }

        $limit = max(1, (int) config('services.steam.recent_limit', 6));
        $games = $response->json('response.games', []);
        if (!is_array($games)) {
            return [];
        }

        return array_values(array_map(
            static fn (array $game): array => [
                'appid' => (int) ($game['appid'] ?? 0),
                'name' => $game['name'] ?? 'Jogo sem nome',
                'playtime_forever' => (int) ($game['playtime_forever'] ?? 0),
                'playtime_2weeks' => isset($game['playtime_2weeks'])
                    ? (int) $game['playtime_2weeks']
                    : null,
                'image_url' => !empty($game['appid'])
                    ? 'https://cdn.cloudflare.steamstatic.com/steam/apps/' . (int) $game['appid'] . '/header.jpg'
                    : null,
            ],
            array_slice($games, 0, $limit),
        ));
    }

    private function httpClient(): \Illuminate\Http\Client\PendingRequest
    {
        $request = Http::withOptions([]);
        $caBundle = config('services.steam.ca_bundle');

        if (is_string($caBundle) && $caBundle !== '' && is_readable($caBundle)) {
            return $request->withOptions(['verify' => $caBundle]);
        }

        return $request;
    }
}
