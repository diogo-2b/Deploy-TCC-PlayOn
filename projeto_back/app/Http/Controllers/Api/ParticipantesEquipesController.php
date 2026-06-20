<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Participantes_Equipes;
use App\Models\Equipe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ParticipantesEquipesController extends Controller
{
    /**
     * Listar todos os membros de uma equipe
     */
    public function index(Request $request, $equipaId)
    {
        $equipe = Equipe::with('usuario')->findOrFail($equipaId);

        $query = Participantes_Equipes::where('id_equipe', $equipaId)
            ->with('usuario')
            ->orderBy('created_at');

        if (!$request->boolean('include_pending')) {
            $usuarioId = Auth::id();
            $query->where(function ($subQuery) use ($usuarioId) {
                $subQuery->where('aprovado', true);

                if ($usuarioId) {
                    $subQuery->orWhere('id_usuario', $usuarioId);
                }
            });
        }

        $membros = $query->get();

        // Marca membros normais como não-dono
        $membros->each(function ($membro) {
            $membro->setAttribute('is_owner', false);
        });

        // Garante que o dono apareça na listagem mesmo sem vínculo na tabela pivot
        $donoJaNaLista = $membros->contains(function ($membro) use ($equipe) {
            return (int) $membro->id_usuario === (int) $equipe->administrador;
        });

        if (!$donoJaNaLista && $equipe->usuario) {
            $membroDono = new Participantes_Equipes([
                'id_equipe' => $equipe->id,
                'id_usuario' => $equipe->administrador,
                'aprovado' => true,
            ]);

            $membroDono->setAttribute('id', null);
            $membroDono->setRelation('usuario', $equipe->usuario);
            $membroDono->setAttribute('is_owner', true);

            $membros->prepend($membroDono);
        }

        return response()->json($membros);
    }

    /**
     * Solicitar participação em uma equipe
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_equipe' => 'required|exists:equipes,id',
        ]);

        $usuarioId = Auth::id();
        $equipe = Equipe::findOrFail($validated['id_equipe']);

        // Verifica se o usuário já é membro
        $existente = Participantes_Equipes::where('id_equipe', $validated['id_equipe'])
            ->where('id_usuario', $usuarioId)
            ->first();

        if ($existente) {
            return response()->json(['message' => 'Você já é membro desta equipe'], 409);
        }

        $participacao = Participantes_Equipes::create([
            'id_equipe' => $validated['id_equipe'],
            'id_usuario' => $usuarioId,
            'aprovado' => (bool) $equipe->tipo,
        ]);

        return response()->json($participacao, 201);
    }

    /**
     * Obter detalhes de um membro
     */
    public function show($id)
    {
        $membro = Participantes_Equipes::findOrFail($id)
            ->load('usuario', 'equipe');

        return response()->json($membro);
    }

    /**
     * Atualizar status de participação (aprovar/rejeitar)
     */
    public function update(Request $request, $id)
    {
        $membro = Participantes_Equipes::findOrFail($id);
        $equipe = $membro->equipe;

        // Verificar se o usuário é administrador da equipe
        if ($equipe->administrador !== Auth::id()) {
            return response()->json(['message' => 'Não autorizado'], 403);
        }

        $validated = $request->validate([
            'aprovado' => 'required|boolean',
        ]);

        $membro->update($validated);

        return response()->json($membro);
    }

    /**
     * Remover um membro da equipe
     */
    public function destroy($id)
    {
        $membro = Participantes_Equipes::findOrFail($id);
        $equipe = $membro->equipe;

        // Verificar se o usuário é administrador da equipe ou o próprio usuário
        if ($equipe->administrador !== Auth::id() && $membro->id_usuario !== Auth::id()) {
            return response()->json(['message' => 'Não autorizado'], 403);
        }

        $membro->delete();

        return response()->json(['message' => 'Membro removido com sucesso']);
    }

    /**
     * Sair de uma equipe
     */
    public function sair($equipaId)
    {
        $usuarioId = Auth::id();

        $membro = Participantes_Equipes::where('id_equipe', $equipaId)
            ->where('id_usuario', $usuarioId)
            ->firstOrFail();

        $membro->delete();

        return response()->json(['message' => 'Você saiu da equipe com sucesso']);
    }
}
