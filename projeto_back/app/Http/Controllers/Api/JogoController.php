<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\IgdbService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class JogoController extends Controller
{
    public function search(Request $request, IgdbService $igdb)
    {
        $validated = $request->validate([
            'search' => ['required', 'string', 'min:1', 'max:100'],
        ]);

        try {
            $jogos = $igdb->searchGames($validated['search']);

            return response()->json($jogos);
        } catch (Throwable $e) {
            Log::error('Erro ao consultar IGDB', [
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Não foi possível pesquisar jogos no momento.',
            ], 502);
        }
    }

    public function cover(Request $request, IgdbService $igdb)
    {
        $validated = $request->validate([
            'search' => ['required', 'string', 'min:1', 'max:100'],
        ]);

        try {
            return response()->json([
                'capa_url' => $igdb->findCoverByName($validated['search']),
            ]);
        } catch (Throwable $e) {
            Log::warning('Erro ao consultar capa de jogo no IGDB.', [
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Não foi possível consultar a capa alternativa.',
            ], 502);
        }
    }
}
