<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sessao;
use Illuminate\Http\Request;

class SessaoController extends Controller
{
    public function index()
    {
        return response()->json(
            Sessao::with('criador')
                ->with('jogadores')
                ->withCount('jogadores')
                ->get()
        );
    }

    public function show($id)
    {
        return response()->json(
            Sessao::with('criador')
                ->with('jogadores')
                ->withCount('jogadores')
                ->findOrFail($id)
        );
    }

    public function store(Request $request)
    {
        $dados = $request->validate([
            'criador_id' => 'required|exists:usuarios,id',
            'titulo' => 'required|string|max:255',
            'descricao' => 'nullable|string',
            'jogo' => 'required|string|max:255',
            'max_jogadores' => 'required|integer|min:1',
            'status' => 'nullable|in:aberta,fechada,encerrada',
        ]);

        if (! isset($dados['status'])) {
            $dados['status'] = 'aberta';
        }

        $sessao = Sessao::create($dados);

        $sessao->jogadores()->syncWithoutDetaching([
            $dados['criador_id'],
        ]);

        $sessao->load('criador', 'jogadores');

        return response()->json(
            $sessao->loadCount('jogadores'),
            201
        );
    }

    public function update(Request $request, $id)
    {
        $sessao = Sessao::findOrFail($id);
        $user = $request->user();

        if (!$user || (int) $user->id !== (int) $sessao->criador_id) {
            return response()->json([
                'message' => 'Você não tem permissão para editar esta sessão.'
            ], 403);
        }

        $dados = $request->validate([
            'titulo' => 'sometimes|required|string|max:255',
            'descricao' => 'nullable|string',
            'jogo' => 'sometimes|required|string|max:255',
            'max_jogadores' => 'sometimes|required|integer|min:1',
            'status' => 'sometimes|required|in:aberta,fechada,encerrada',
        ]);

        $sessao->update($dados);

        return response()->json(
            $sessao->fresh()->load('criador', 'jogadores')->loadCount('jogadores')
        );
    }

    public function destroy($id)
    {
        $sessao = Sessao::findOrFail($id);
        $user = request()->user();

        if (!$user || (int) $user->id !== (int) $sessao->criador_id) {
            return response()->json([
                'message' => 'Você não tem permissão para excluir esta sessão.'
            ], 403);
        }

        $sessao->delete();

        return response()->json([
            'message' => 'Sessão removida'
        ]);
    }

    public function entrar($id, Request $request) {
    $sessao = Sessao::findOrFail($id);

    $dados = $request->validate([
        'usuario_id' => 'required|exists:usuarios,id',
    ]);

    $usuarioId = $dados['usuario_id'];

    if ($sessao->jogadores()->where('usuarios.id', $usuarioId)->exists()) {
        return response()->json([
            'message' => 'Usuário já está vinculado à sessão'
        ], 409);
    }

    if ($sessao->jogadores()->count() >= $sessao->max_jogadores) {
        return response()->json([
            'message' => 'A sessão já atingiu o número máximo de jogadores'
        ], 422);
    }

    $sessao->jogadores()
        ->syncWithoutDetaching([$usuarioId]);

    return response()->json([
        'message' => 'Entrou na sessão'
    ]);
    }

    public function sair($id, Request $request) {
    $sessao = Sessao::findOrFail($id);

    $dados = $request->validate([
        'usuario_id' => 'required|exists:usuarios,id',
    ]);

    if ((int) $dados['usuario_id'] === (int) $sessao->criador_id) {
        return response()->json([
            'message' => 'O criador não pode sair da própria sessão'
        ], 422);
    }

    $sessao->jogadores()
        ->detach($dados['usuario_id']);

    return response()->json([
        'message' => 'Saiu da sessão'
    ]);
    }
}
