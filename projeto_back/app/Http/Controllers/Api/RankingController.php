<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Equipe;
use App\Models\Usuario;
use Illuminate\Http\JsonResponse;

class RankingController extends Controller
{
    public function index(): JsonResponse
    {
        $usuarios = Usuario::query()
            ->select(['id', 'nome', 'apelido', 'imagem', 'pontos'])
            ->orderByRaw('COALESCE(pontos, 0) DESC')
            ->orderBy('nome')
            ->orderBy('id')
            ->limit(5)
            ->get()
            ->map(fn (Usuario $usuario) => [
                'id' => $usuario->id,
                'nome' => $usuario->nome,
                'apelido' => $usuario->apelido,
                'imagem_url' => $usuario->imagem_url,
                'pontos' => $usuario->pontos,
            ]);

        $equipes = Equipe::query()
            ->select(['id', 'nome', 'imagem', 'pontos'])
            ->orderByRaw('COALESCE(pontos, 0) DESC')
            ->orderBy('nome')
            ->orderBy('id')
            ->limit(5)
            ->get()
            ->map(fn (Equipe $equipe) => [
                'id' => $equipe->id,
                'nome' => $equipe->nome,
                'imagem_url' => $equipe->imagem_url,
                'pontos' => $equipe->pontos,
            ]);

        return response()->json([
            'usuarios' => $usuarios,
            'equipes' => $equipes,
        ]);
    }
}
