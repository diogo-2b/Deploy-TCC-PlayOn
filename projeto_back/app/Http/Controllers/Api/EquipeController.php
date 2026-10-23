<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Equipe;
use App\Http\Requests\EquipeStoreRequest;
use App\Http\Requests\EquipeUpdateRequest;
use App\Http\Resources\EquipeResource;
use App\Services\CloudinaryService;
use App\Models\Competicao;
use Illuminate\Http\Request;

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

    public function historicoCompeticoes(Request $request, $id)
    {
        $equipe = Equipe::with('membros')->findOrFail($id);
        $usuario = $request->user();
        $membroAtual = $usuario && (
            (int) $equipe->administrador === (int) $usuario->id ||
            $equipe->membros->contains(function ($membro) use ($usuario) {
                return (int) $membro->id_usuario === (int) $usuario->id
                    && (bool) $membro->aprovado;
            })
        );

        if (!$membroAtual && (!$usuario || !$usuario->is_admin)) {
            return response()->json(['message' => 'Não autorizado'], 403);
        }

        $competicoes = Competicao::whereHas('participantes', function ($query) use ($id) {
            $query->where('tipo_participante', 'equipe')
                ->where('id_participante', $id)
                ->where('aprovado', true);
        })->where('data_encerramento', '<', now()->toDateString())
            ->orderByDesc('data_encerramento')
            ->get();

        return CompeticaoResource::collection($competicoes);
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

        if (!$user || (!$user->is_admin && (int) $user->id !== (int) $equipe->administrador)) {
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
