<?php

namespace App\Http\Controllers;

use App\Models\Equipe;
use App\Http\Requests\EquipeStoreRequest;
use App\Http\Requests\EquipeUpdateRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;

class EquipeController extends Controller
{
    public function index(Request $request)
    {
        $listaEquipes = Equipe::all();

        if ($request->wantsJson()) {
            return response()->json($listaEquipes);
        }

        return View::make('equipes.index', ["listaEquipes" => $listaEquipes]);
    }

    public function show(Request $request, $id)
    {
        $equipe = Equipe::findOrFail($id);

        if ($request->wantsJson()) {
            return response()->json($equipe);
        }

        return view('equipes.show', ['equipe' => $equipe]);
    }

    public function create()
    {
        return view('equipes.create');
    }

    public function store(EquipeStoreRequest $request)
    {
        $data = $request->validated();

        $equipe = Equipe::create($data);

        if ($request->wantsJson()) {
            return response()->json($equipe, 201);
        }

        return redirect('/equipes');
    }

    public function edit($id)
    {
        $equipe = Equipe::find($id);

        if ($equipe)
            return view('equipes.edit', compact('equipe'));

        dd("Equipe não encontrada!!!");
    }

    public function update(Request $request, $id)
    {
        $updatedEquipe = $request->all();
        $updatedEquipe['tipo'] = $request->has('tipo');

        $equipeAtual = Equipe::findOrFail($id);
        $equipeAtual->update($updatedEquipe);

        if ($request->wantsJson()) {
            return response()->json($equipeAtual);
        }

        return redirect('/equipes');
    }

    public function remove($id)
    {
        $equipe = Equipe::find($id);

        if ($equipe)
            return view('equipes.remove', compact('equipe'));

        dd("Equipe não encontrada!!!");
    }

    public function destroy(Request $request, $id)
    {
        $equipe = Equipe::findOrFail($id);
        $equipe->delete();

        if ($request->wantsJson()) {
            return response()->noContent();
        }

        return redirect('/equipes');
    }
}
