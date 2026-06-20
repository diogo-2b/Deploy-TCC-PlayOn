<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sessao;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SessaoJogadoresController extends Controller
{
    public function index($sessaoId)
    {
        $sessao = Sessao::findOrFail($sessaoId);

        return response()->json(
            $sessao->jogadores()->get()
        );
    }

    public function store(Request $request, $sessaoId)
    {
        $sessao = Sessao::findOrFail($sessaoId);
        $usuarioId = (int) ($request->input('usuario_id') ?? Auth::id());

        if (!$usuarioId) {
            return response()->json([
                'message' => 'Usuário não autenticado.'
            ], 401);
        }

        if ((int) $sessao->criador_id === $usuarioId) {
            return response()->json([
                'message' => 'O criador já participa automaticamente da sessão.'
            ], 409);
        }

        if ($sessao->jogadores()->where('usuarios.id', $usuarioId)->exists()) {
            return response()->json([
                'message' => 'Você já está participando desta sessão.'
            ], 409);
        }

        if ($sessao->jogadores()->count() >= $sessao->max_jogadores) {
            return response()->json([
                'message' => 'A sessão já atingiu o limite de jogadores.'
            ], 422);
        }

        $sessao->jogadores()->syncWithoutDetaching([$usuarioId]);

        return response()->json([
            'message' => 'Inscrição realizada com sucesso.'
        ], 201);
    }

    public function destroy(Request $request, $sessaoId, $usuarioId)
    {
        $sessao = Sessao::findOrFail($sessaoId);
        $usuarioAutenticado = Auth::id();

        if (!$usuarioAutenticado) {
            return response()->json([
                'message' => 'Usuário não autenticado.'
            ], 401);
        }

        if ((int) $sessao->criador_id === (int) $usuarioId) {
            return response()->json([
                'message' => 'O criador não pode sair da sessão.'
            ], 422);
        }

        if ((int) $usuarioAutenticado !== (int) $usuarioId
            && (int) $usuarioAutenticado !== (int) $sessao->criador_id) {
            return response()->json([
                'message' => 'Não autorizado.'
            ], 403);
        }

        if (!$sessao->jogadores()->where('usuarios.id', $usuarioId)->exists()) {
            return response()->json([
                'message' => 'Você não está participando desta sessão.'
            ], 404);
        }

        $sessao->jogadores()->detach($usuarioId);

        return response()->json([
            'message' => 'Você saiu da sessão com sucesso.'
        ]);
    }
}
