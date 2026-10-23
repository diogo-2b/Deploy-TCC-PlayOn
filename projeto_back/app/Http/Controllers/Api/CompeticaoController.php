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
use Illuminate\Support\Facades\Auth;

class CompeticaoController extends Controller
{
    public function index()
    {
        return CompeticaoResource::collection(Competicao::ativas()->with('jogo')->get());
    }

    public function show($id)
    {
        $competicao = Competicao::findOrFail($id);

        if ($competicao->isEncerrada() && !$this->usuarioPodeVerEncerrada($competicao)) {
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
        if ($request->hasFile('imagem')) {
            $data['imagem'] = $cloudinary->upload($request->file('imagem'), 'playon/competicoes');
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

    private function usuarioPodeVerEncerrada(Competicao $competicao): bool
    {
        $user = Auth::user();
        if (!$user) {
            return false;
        }

        if ($user->is_admin || (int) $competicao->dono === (int) $user->id) {
            return true;
        }

        return $competicao->participantes()
            ->where('aprovado', true)
            ->where(function ($query) use ($user) {
                $query->where(function ($query) use ($user) {
                    $query->where('tipo_participante', 'usuario')
                        ->where('id_participante', $user->id);
                })->orWhere(function ($query) use ($user) {
                    $query->where('tipo_participante', 'equipe')
                        ->whereHas('equipe', function ($teamQuery) use ($user) {
                            $teamQuery->where('administrador', $user->id)
                                ->orWhereHas('membros', function ($memberQuery) use ($user) {
                                    $memberQuery->where('id_usuario', $user->id)
                                        ->where('aprovado', true);
                                });
                        });
                });
            })->exists();
    }
}
