<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Equipe;
use App\Http\Requests\EquipeStoreRequest;
use App\Http\Requests\EquipeUpdateRequest;
use App\Http\Resources\EquipeResource;
use App\Services\CloudinaryService;

class EquipeController extends Controller
{
    public function index()
    {
        return EquipeResource::collection(Equipe::all());
    }

    public function show($id)
    {
        return new EquipeResource(Equipe::findOrFail($id));
    }

    public function store(EquipeStoreRequest $request, CloudinaryService $cloudinary)
    {
        $data = $request->validated();
        if ($request->hasFile('imagem')) {
            $data['imagem'] = $cloudinary->upload($request->file('imagem'), 'playon/equipes');
        }

        $equipe = Equipe::create($data);

        return (new EquipeResource($equipe))->response()->setStatusCode(201);
    }

    public function update(EquipeUpdateRequest $request, $id, CloudinaryService $cloudinary)
    {
        $equipe = Equipe::findOrFail($id);
        $user = $request->user();

        if (!$user || (int) $user->id !== (int) $equipe->administrador) {
            return response()->json([
                'message' => 'Você não tem permissão para editar esta equipe.'
            ], 403);
        }

        $data = $request->validated();
        if ($request->hasFile('imagem')) {
            $data['imagem'] = $cloudinary->upload($request->file('imagem'), 'playon/equipes');
        }

        $equipe->update($data);

        return new EquipeResource($equipe);
    }

    public function destroy($id)
    {
        $equipe = Equipe::findOrFail($id);
        $user = request()->user();

        if (!$user || (int) $user->id !== (int) $equipe->administrador) {
            return response()->json([
                'message' => 'Você não tem permissão para excluir esta equipe.'
            ], 403);
        }

        $equipe->delete();

        return response()->noContent();
    }
}
