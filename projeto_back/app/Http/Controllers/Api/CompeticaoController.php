<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Competicao;
use App\Models\Jogo;
use App\Http\Requests\CompeticaoStoreRequest;
use App\Http\Requests\CompeticaoUpdateRequest;
use App\Http\Resources\CompeticaoResource;
use App\Services\CloudinaryService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class CompeticaoController extends Controller
{
    public function index()
    {
        return CompeticaoResource::collection(Competicao::ativas()->with('jogo')->get());
    }

    public function show(\Illuminate\Http\Request $request, $id)
    {
        $competicao = Competicao::findOrFail($id);

        if ($competicao->isEncerrada()
            && (!$request->user() || !$competicao->usuarioPodeAcessarDetalhes($request->user()))) {
            return response()->json(['message' => 'Esta competição foi encerrada.'], 403);
        }

        if ($competicao->jogo_id) {
            $competicao->load('jogo');
        }

        return new CompeticaoResource($competicao);
    }

    public function store(CompeticaoStoreRequest $request, CloudinaryService $cloudinary)
    {
        $data = $request->validated();
        $data['modo'] = $data['modo'] ?? 'personalizado';
        if ($data['modo'] === 'personalizado') {
            $data['formato'] = null;
            $data['quantidade_participantes'] = null;
            $data['numero_rodadas'] = null;
        }
        $data['dono'] = $request->user()->id;
        if ($request->hasFile('imagem')) {
            $data['imagem'] = $cloudinary->upload($request->file('imagem'), 'playon/competicoes');
        } else {
            $data['imagem'] = config('app.default_competition_image_url');
        }

        try {
            $competicao = DB::transaction(function () use ($data) {
                if (!empty($data['igdb_id'])) {
                    $jogo = Jogo::updateOrCreate(
                        ['igdb_id' => $data['igdb_id']],
                        [
                            'nome' => $data['jogo_nome'],
                            'capa_url' => $data['jogo_capa_url'] ?? null,
                        ]
                    );

                    $data['jogo_id'] = $jogo->id;
                }

                unset($data['igdb_id'], $data['jogo_nome'], $data['jogo_capa_url']);

                return Competicao::create($data);
            });
        } catch (Throwable $exception) {
            Log::error('Erro ao cadastrar competição', [
                'message' => $exception->getMessage(),
                'exception' => $exception,
            ]);

            return response()->json([
                'message' => 'Não foi possível salvar a competição.',
            ], 500);
        }

        return (new CompeticaoResource($competicao))
            ->response()
            ->setStatusCode(201);
    }

    public function update(CompeticaoUpdateRequest $request, $id, CloudinaryService $cloudinary)
    {
        $competicao = Competicao::findOrFail($id);
        $user = $request->user();

        if ($competicao->isEncerrada()) {
            return response()->json([
                'message' => 'Competições encerradas não podem ser editadas.'
            ], 422);
        }

        if (!$user || (!$user->is_admin && (int) $user->id !== (int) $competicao->dono)) {
            return response()->json([
                'message' => 'Você não tem permissão para editar esta competição.'
            ], 403);
        }

        $data = $request->validated();
        unset($data['dono']);
        if (($data['modo'] ?? null) === 'personalizado') {
            $data['formato'] = null;
            $data['quantidade_participantes'] = null;
            $data['numero_rodadas'] = null;
        }
        if ($competicao->partidas()->exists()) {
            foreach (['modo', 'formato', 'quantidade_participantes', 'numero_rodadas', 'inscricao'] as $campo) {
                if (array_key_exists($campo, $data) && $data[$campo] != $competicao->{$campo}) {
                    return response()->json([
                        'message' => 'O formato não pode ser alterado após a geração das partidas.',
                    ], 422);
                }
            }
        }
        if ($competicao->participantes()->exists() && array_key_exists('inscricao', $data)
            && (bool) $data['inscricao'] !== (bool) $competicao->inscricao) {
            return response()->json([
                'message' => 'O tipo de participante não pode ser alterado após inscrições.',
            ], 422);
        }
        if ($request->hasFile('imagem')) {
            $data['imagem'] = $cloudinary->upload($request->file('imagem'), 'playon/competicoes');
        }

        try {
            $competicao = DB::transaction(function () use ($data, $competicao) {
                if (!empty($data['igdb_id'])) {
                    $jogo = Jogo::updateOrCreate(
                        ['igdb_id' => $data['igdb_id']],
                        [
                            'nome' => $data['jogo_nome'],
                            'capa_url' => $data['jogo_capa_url'] ?? null,
                        ]
                    );

                    $data['jogo_id'] = $jogo->id;
                }

                unset($data['igdb_id'], $data['jogo_nome'], $data['jogo_capa_url']);
                $competicao->update($data);

                return $competicao;
            });
        } catch (Throwable $exception) {
            Log::error('Erro ao alterar competição', [
                'competicao_id' => $competicao->id,
                'message' => $exception->getMessage(),
                'exception' => $exception,
            ]);

            return response()->json([
                'message' => 'Não foi possível salvar as alterações da competição.',
            ], 500);
        }

        if ($competicao->jogo_id) {
            $competicao->load('jogo');
        }

        return new CompeticaoResource($competicao);
    }

    public function destroy($id)
    {
        $competicao = Competicao::findOrFail($id);
        $user = request()->user();

        if (!$user || (int) $user->id !== (int) $competicao->dono) {
            return response()->json([
                'message' => 'Você não tem permissão para excluir esta competição.'
            ], 403);
        }

        $competicao->delete();

        return response()->noContent();
    }

}
