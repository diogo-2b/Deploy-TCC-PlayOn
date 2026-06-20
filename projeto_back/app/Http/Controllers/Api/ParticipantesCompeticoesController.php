<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Participantes_Competicoes;
use App\Models\Competicao;
use App\Models\Equipe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ParticipantesCompeticoesController extends Controller
{
    /**
     * Listar todos os participantes de uma competição
     */
    public function index(Request $request, $competicaoId)
    {
        $query = Participantes_Competicoes::where('id_competicao', $competicaoId)
            ->with(['participante', 'equipe', 'competicao'])
            ->orderBy('created_at');

        if (!$request->boolean('include_pending')) {
            $usuarioId = Auth::id();
            $equipesDoUsuario = $usuarioId
                ? Equipe::where('administrador', $usuarioId)->pluck('id')->toArray()
                : [];

            $query->where(function ($subQuery) use ($usuarioId, $equipesDoUsuario) {
                $subQuery->where('aprovado', true);

                if ($usuarioId) {
                    $subQuery->orWhere(function ($userQuery) use ($usuarioId) {
                        $userQuery->where('tipo_participante', 'usuario')
                            ->where('id_participante', $usuarioId);
                    });
                }

                if (!empty($equipesDoUsuario)) {
                    $subQuery->orWhere(function ($teamQuery) use ($equipesDoUsuario) {
                    $teamQuery->where('tipo_participante', 'equipe')
                        ->whereIn('id_participante', $equipesDoUsuario);
                });
                }
            });
        }

        $participantes = $query->get();

        return response()->json($participantes);
    }

    /**
     * Inscrever em uma competição (usuário ou equipe)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_competicao' => 'required|exists:competicoes,id',
            'tipo_participante' => 'required|in:usuario,equipe',
            'id_participante' => 'required|integer',
        ]);

        $competicao = Competicao::findOrFail($validated['id_competicao']);

        // Verificar se o tipo de participante matches a competição
        if ($validated['tipo_participante'] === 'usuario' && $competicao->inscricao) {
            return response()->json(['message' => 'Essa competição só aceita inscrições de equipes'], 400);
        }

        if ($validated['tipo_participante'] === 'equipe' && !$competicao->inscricao) {
            return response()->json(['message' => 'Essa competição só aceita inscrições de usuários'], 400);
        }

        // Validar se o participante existe
        if ($validated['tipo_participante'] === 'usuario') {
            \App\Models\Usuario::findOrFail($validated['id_participante']);
            $usuarioId = Auth::id();
            if ($usuarioId !== $validated['id_participante']) {
                return response()->json(['message' => 'Você pode apenas inscrever a si mesmo'], 403);
            }
        } else {
            $equipe = Equipe::findOrFail($validated['id_participante']);
            if ($equipe->administrador !== Auth::id()) {
                return response()->json(['message' => 'Você deve ser administrador da equipe'], 403);
            }
        }

        // Verificar se já está inscrito
        $existente = Participantes_Competicoes::where('id_competicao', $validated['id_competicao'])
            ->where('id_participante', $validated['id_participante'])
            ->where('tipo_participante', $validated['tipo_participante'])
            ->first();

        if ($existente) {
            return response()->json(['message' => 'Já está inscrito nesta competição'], 409);
        }

        // Competição pública aprova automaticamente; privada fica pendente
        $aprovado = (bool) $competicao->tipo;

        $participacao = Participantes_Competicoes::create([
            'id_competicao' => $validated['id_competicao'],
            'id_participante' => $validated['id_participante'],
            'tipo_participante' => $validated['tipo_participante'],
            'aprovado' => $aprovado,
        ]);

        return response()->json($participacao, 201);
    }

    /**
     * Obter detalhes de uma participação
     */
    public function show($id)
    {
        $participacao = Participantes_Competicoes::findOrFail($id)
            ->load(['participante', 'equipe', 'competicao']);

        return response()->json($participacao);
    }

    /**
     * Atualizar status de participação (aprovar/rejeitar)
     */
    public function update(Request $request, $id)
    {
        $participacao = Participantes_Competicoes::findOrFail($id);
        $competicao = $participacao->competicao;

        // Verificar se o usuário é dono da competição
        if ($competicao->dono !== Auth::id()) {
            return response()->json(['message' => 'Não autorizado'], 403);
        }

        $validated = $request->validate([
            'aprovado' => 'required|boolean',
        ]);

        $participacao->update($validated);

        return response()->json($participacao);
    }

    /**
     * Remover um participante da competição
     */
    public function destroy($id)
    {
        $participacao = Participantes_Competicoes::findOrFail($id);
        $competicao = $participacao->competicao;
        $usuarioId = Auth::id();

        // Permitir remoção pelo dono da competição
        if ((int) $competicao->dono === (int) $usuarioId) {
            $participacao->delete();

            return response()->json(['message' => 'Participante removido com sucesso']);
        }

        // Permitir remoção pelo administrador da equipe participante
        if ($participacao->tipo_participante === 'equipe') {
            $equipe = Equipe::find($participacao->id_participante);
            if ($equipe && (int) $equipe->administrador === (int) $usuarioId) {
                $participacao->delete();

                return response()->json(['message' => 'Equipe removida da competição com sucesso']);
            }
        }

        return response()->json(['message' => 'Não autorizado'], 403);
    }

    /**
     * Desinscrever de uma competição
     */
    public function sair(Request $request, $competicaoId)
    {
        $usuarioId = Auth::id();
        $tipoParticipante = $request->input('tipo_participante', 'usuario');

        if ($tipoParticipante === 'equipe') {
            $equipeId = (int) $request->input('id_participante', 0);
            $equipe = Equipe::findOrFail($equipeId);

            if ((int) $equipe->administrador !== (int) $usuarioId) {
                return response()->json(['message' => 'Não autorizado'], 403);
            }

            $participacao = Participantes_Competicoes::where('id_competicao', $competicaoId)
                ->where('id_participante', $equipeId)
                ->where('tipo_participante', 'equipe')
                ->firstOrFail();

            $participacao->delete();

            return response()->json(['message' => 'Equipe removida da competição com sucesso']);
        }

        $participacao = Participantes_Competicoes::where('id_competicao', $competicaoId)
            ->where('id_participante', $usuarioId)
            ->where('tipo_participante', 'usuario')
            ->firstOrFail();

        $participacao->delete();

        return response()->json(['message' => 'Desinscrição realizada com sucesso']);
    }
}
