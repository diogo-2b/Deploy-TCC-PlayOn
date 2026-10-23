<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UsuarioResource;
use App\Models\ContaSteam;
use App\Models\Usuario;
use App\Services\SteamService;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use RuntimeException;

class SteamController extends Controller
{
    public function start(Request $request, SteamService $steam)
    {
        $state = Str::random(64);
        Cache::put('steam_openid:' . $state, $request->user()->id, now()->addMinutes(10));

        return response()->json(['authorization_url' => $steam->authorizationUrl($state)]);
    }

    public function callback(Request $request, SteamService $steam)
    {
        $state = $request->query('state');
        $userId = is_string($state) ? Cache::pull('steam_openid:' . $state) : null;
        $stage = 'state';

        try {
            if (!$userId) {
                throw new RuntimeException('A autenticação Steam expirou ou foi cancelada.');
            }

            $stage = 'openid';
            $steamId = $steam->validateOpenId($request->query(), $state);
            $stage = 'summary';
            $summary = $steam->playerSummary($steamId);
            $stage = 'association';
            $existingAccount = ContaSteam::where('steam_id', $steamId)->first();

            if ($existingAccount && (int) $existingAccount->usuario_id !== (int) $userId) {
                throw new RuntimeException('Esta conta Steam já está vinculada a outro usuário.');
            }

            DB::transaction(function () use ($userId, $summary): void {
                ContaSteam::updateOrCreate(
                    ['usuario_id' => $userId],
                    [
                        'steam_id' => $summary['steam_id'],
                        'personaname' => $summary['steam_personaname'],
                        'avatar' => $summary['steam_avatar'],
                        'profile_url' => $summary['steam_profile_url'],
                        'personastate' => $summary['steam_personastate'],
                        'last_synced_at' => $summary['steam_last_synced_at'],
                    ],
                );
            });

            return redirect()->to(config('services.steam.frontend_callback_url') . '?steam=linked');
        } catch (QueryException $exception) {
            Log::warning('Falha ao persistir vínculo Steam.', ['stage' => $stage]);
            return redirect()->to(config('services.steam.frontend_callback_url') . '?steam=error&reason=storage');
        } catch (RuntimeException $exception) {
            $status = str_contains($exception->getMessage(), 'cancelada') ? 'cancelled' : 'error';
            $reason = $status === 'cancelled'
                ? 'cancelled'
                : ($stage === 'openid' ? match (true) {
                    str_contains($exception->getMessage(), 'namespace') => 'openid_namespace',
                    str_contains($exception->getMessage(), 'modo') => 'openid_mode',
                    str_contains($exception->getMessage(), 'identidade') => 'openid_identity',
                    str_contains($exception->getMessage(), 'Steam ID') => 'openid_id',
                    str_contains($exception->getMessage(), 'retorno') => 'openid_return_to',
                    str_contains($exception->getMessage(), 'campos assinados') => 'openid_signed',
                    str_contains($exception->getMessage(), 'campo assinado') => 'openid_signed_field',
                    str_contains($exception->getMessage(), 'assinatura ausente') => 'openid_sig',
                    str_contains($exception->getMessage(), 'parâmetro inválido') => 'openid_parameter',
                    str_contains($exception->getMessage(), 'conectar à Steam') => 'openid_connection',
                    default => 'openid_signature',
                } : $stage);
            Log::warning('Falha no vínculo Steam.', ['stage' => $stage, 'reason' => $reason]);
            return redirect()->to(config('services.steam.frontend_callback_url') . '?steam=' . $status . '&reason=' . $reason);
        }
    }

    public function unlink(Request $request)
    {
        $request->user()->contaSteam()->delete();

        return response()->json(['user' => new UsuarioResource($request->user()->fresh())]);
    }

    public function status(Request $request)
    {
        return new UsuarioResource($request->user());
    }

    public function recentlyPlayedGames(Request $request, string $usuarioId, SteamService $steam)
    {
        $usuario = Usuario::with('contaSteam')->findOrFail($usuarioId);
        if (!$usuario->contaSteam) {
            return response()->json([
                'message' => 'Este usuário não possui uma conta Steam vinculada.',
                'games' => null,
            ], 404);
        }

        try {
            return response()->json([
                'games' => $steam->recentlyPlayedGames($usuario->contaSteam->steam_id),
            ]);
        } catch (RuntimeException $exception) {
            Log::warning('Falha ao consultar jogos recentes da Steam.', [
                'user_id' => $usuario->id,
            ]);

            return response()->json([
                'message' => 'Não foi possível consultar os jogos recentes da Steam.',
                'games' => null,
            ], 503);
        }
    }
}
