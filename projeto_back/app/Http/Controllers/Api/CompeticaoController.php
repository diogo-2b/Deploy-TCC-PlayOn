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

class CompeticaoController extends Controller
{
    public function index()
    {
        return CompeticaoResource::collection(Competicao::all());
    }

    public function show($id)
    {
        return new CompeticaoResource(Competicao::with('jogo')->findOrFail($id));
    }

    public function store(CompeticaoStoreRequest $request, CloudinaryService $cloudinary)
    {
        $data = $request->validated();
        if ($request->hasFile('imagem')) {
            $data['imagem'] = $cloudinary->upload($request->file('imagem'), 'playon/competicoes');
        }

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

        return (new CompeticaoResource($competicao->load('jogo')))
            ->response()
            ->setStatusCode(201);
    }

    public function update(CompeticaoUpdateRequest $request, $id, CloudinaryService $cloudinary)
    {
        $competicao = Competicao::findOrFail($id);
        $user = $request->user();

        if (!$user || (int) $user->id !== (int) $competicao->dono) {
            return response()->json([
                'message' => 'Você não tem permissão para editar esta competição.'
            ], 403);
        }

        $data = $request->validated();
        if ($request->hasFile('imagem')) {
            $data['imagem'] = $cloudinary->upload($request->file('imagem'), 'playon/competicoes');
        }

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

        return new CompeticaoResource($competicao->load('jogo'));
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
