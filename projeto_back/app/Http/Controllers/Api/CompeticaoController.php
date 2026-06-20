<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Competicao;
use App\Http\Requests\CompeticaoStoreRequest;
use App\Http\Requests\CompeticaoUpdateRequest;
use App\Http\Resources\CompeticaoResource;
use Illuminate\Support\Facades\Storage;

class CompeticaoController extends Controller
{
    public function index()
    {
        return CompeticaoResource::collection(Competicao::all());
    }

    public function show($id)
    {
        return new CompeticaoResource(Competicao::findOrFail($id));
    }

    public function store(CompeticaoStoreRequest $request)
    {
        $data = $request->validated();
        if ($request->hasFile('imagem')) {
            $path = $request->file('imagem')->store('competicoes', 'public');
            $data['imagem'] = basename($path);
        }

        $competicao = Competicao::create($data);

        return (new CompeticaoResource($competicao))->response()->setStatusCode(201);
    }

    public function update(CompeticaoUpdateRequest $request, $id)
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
            $path = $request->file('imagem')->store('competicoes', 'public');
            $data['imagem'] = basename($path);
        }

        $competicao->update($data);

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
