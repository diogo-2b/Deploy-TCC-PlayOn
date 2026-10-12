<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sessao;
use App\Models\Jogo;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class SessaoController extends Controller
{
    public function index()
    {
        return response()->json(
            Sessao::with('criador')
                ->with('jogoRelacionado')
                ->with('jogadores')
                ->withCount('jogadores')
                ->get()
        );
    }

    public function show($id)
    {
        return response()->json(
            Sessao::with('criador')
                ->with('jogoRelacionado')
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
            'igdb_id' => 'required|integer|min:1',
            'jogo_nome' => 'required|string|max:255',
            'jogo_capa_url' => 'nullable|url|max:2048',
            'max_jogadores' => 'required|integer|min:1',
            'status' => 'nullable|in:aberta,fechada,encerrada',
        ]);

        if (! isset($dados['status'])) {
            $dados['status'] = 'aberta';
        }

        $sessao = DB::transaction(function () use ($dados) {
            if (!empty($dados['igdb_id'])) {
                $jogo = Jogo::updateOrCreate(
                    ['igdb_id' => $dados['igdb_id']],
                    [
                        'nome' => $dados['jogo_nome'],
                        'capa_url' => $dados['jogo_capa_url'] ?? null,
                    ]
                );
                $dados['jogo_id'] = $jogo->id;
            }

            unset($dados['igdb_id'], $dados['jogo_nome'], $dados['jogo_capa_url']);
            return Sessao::create($dados);
        });

        $sessao->jogadores()->syncWithoutDetaching([
            $dados['criador_id'],
        ]);

        $sessao->load('criador', 'jogadores');
        $sessao->load('jogoRelacionado');

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
            'igdb_id' => 'sometimes|required|integer|min:1',
            'jogo_nome' => 'required_with:igdb_id|string|max:255',
            'jogo_capa_url' => 'nullable|url|max:2048',
            'max_jogadores' => 'sometimes|required|integer|min:1',
            'status' => 'sometimes|required|in:aberta,fechada,encerrada',
        ]);

        $sessao = DB::transaction(function () use ($dados, $sessao) {
            if (!empty($dados['igdb_id'])) {
                $jogo = Jogo::updateOrCreate(
                    ['igdb_id' => $dados['igdb_id']],
                    [
                        'nome' => $dados['jogo_nome'],
                        'capa_url' => $dados['jogo_capa_url'] ?? null,
                    ]
                );
                $dados['jogo_id'] = $jogo->id;
            }

            unset($dados['igdb_id'], $dados['jogo_nome'], $dados['jogo_capa_url']);
            $sessao->update($dados);
            return $sessao;
        });

        return response()->json(
            $sessao->fresh()->load('criador', 'jogoRelacionado', 'jogadores')->loadCount('jogadores')
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
