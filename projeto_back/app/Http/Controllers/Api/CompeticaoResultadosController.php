<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Competicao;
use App\Services\CompeticaoResultadosService;
use Illuminate\Http\Request;

class CompeticaoResultadosController extends Controller
{
    public function show(Request $request, $competicaoId, CompeticaoResultadosService $resultados)
    {
        $competicao = Competicao::findOrFail($competicaoId);
        if ($competicao->isEncerrada()
            && (!$request->user() || !$competicao->usuarioPodeAcessarDetalhes($request->user()))) {
            return response()->json(['message' => 'Esta competição foi encerrada.'], 403);
        }

        return response()->json([
            'configuracao' => [
                'modo' => $competicao->modo ?? 'personalizado',
                'formato' => $competicao->formato,
                'quantidade_participantes' => $competicao->quantidade_participantes,
                'numero_rodadas' => $competicao->numero_rodadas,
            ],
            ...$resultados->dadosDaCompeticao($competicao),
        ]);
    }

    public function gerarChave($competicaoId, Request $request, CompeticaoResultadosService $resultados)
    {
        $competicao = Competicao::findOrFail($competicaoId);
        if ($response = $this->validarOrganizador($competicao, $request, true)) {
            return $response;
        }

        $resultados->gerarChave($competicao);

        return response()->json($resultados->dadosDaCompeticao($competicao->fresh()));
    }

    public function criarPartida($competicaoId, Request $request, CompeticaoResultadosService $resultados)
    {
        $competicao = Competicao::findOrFail($competicaoId);
        if ($response = $this->validarOrganizador($competicao, $request)) {
            return $response;
        }

        $dados = $request->validate([
            'rodada' => 'required|integer|min:1|max:2147483647',
            'participante_a_id' => 'required|integer|min:1',
            'participante_b_id' => 'required|integer|min:1|different:participante_a_id',
        ]);

        $resultados->criarPartidaDePontos(
            $competicao,
            (int) $dados['rodada'],
            (int) $dados['participante_a_id'],
            (int) $dados['participante_b_id']
        );

        return response()->json($resultados->dadosDaCompeticao($competicao->fresh()), 201);
    }

    public function registrarResultado($competicaoId, $partidaId, Request $request, CompeticaoResultadosService $resultados)
    {
        $competicao = Competicao::findOrFail($competicaoId);
        if ($response = $this->validarOrganizador($competicao, $request)) {
            return $response;
        }

        $dados = $request->validate([
            'resultado' => 'required|in:a,b,empate',
        ]);

        $partida = $competicao->partidas()->findOrFail($partidaId);
        $resultados->registrarResultado($competicao, $partida, $dados['resultado']);

        return response()->json($resultados->dadosDaCompeticao($competicao->fresh()));
    }

    public function definirPodio($competicaoId, Request $request, CompeticaoResultadosService $resultados)
    {
        $competicao = Competicao::findOrFail($competicaoId);
        if ($response = $this->validarOrganizador($competicao, $request, true)) {
            return $response;
        }

        $dados = $request->validate([
            'primeiro_lugar_id' => 'present|nullable|integer|min:1',
            'segundo_lugar_id' => 'present|nullable|integer|min:1',
            'terceiro_lugar_id' => 'present|nullable|integer|min:1',
        ]);

        $resultados->definirPodioPersonalizado($competicao, $dados);

        return response()->json($resultados->dadosDaCompeticao($competicao->fresh()));
    }

    private function validarOrganizador(Competicao $competicao, Request $request, bool $permitirEncerrada = false): ?\Illuminate\Http\JsonResponse
    {
        $usuario = $request->user();
        if (!$usuario || (!$usuario->is_admin && (int) $usuario->id !== (int) $competicao->dono)) {
            return response()->json(['message' => 'Você não tem permissão para gerenciar os resultados.'], 403);
        }

        if ($competicao->isEncerrada() && !$permitirEncerrada) {
            return response()->json(['message' => 'Esta competição foi encerrada e não aceita alterações de resultados.'], 422);
        }

        return null;
    }

}
