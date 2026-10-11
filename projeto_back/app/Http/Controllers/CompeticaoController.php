<?php

namespace App\Http\Controllers;

use App\Models\Competicao;
use App\Http\Requests\CompeticaoStoreRequest;
use App\Http\Requests\CompeticaoUpdateRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;
use App\Services\CloudinaryService;

class CompeticaoController extends Controller
{
    public function index(Request $request)
    {
        $listaCompeticoes = Competicao::all();

        if ($request->wantsJson()) {
            return response()->json($listaCompeticoes);
        }

        return View::make('competicoes.index', ["listaCompeticoes" => $listaCompeticoes]);
    }

    public function show(Request $request, $id)
    {
        $competicao = Competicao::findOrFail($id);

        if ($request->wantsJson()) {
            return response()->json($competicao);
        }

        return view('competicoes.show', ['competicao' => $competicao]);
    }

    public function create()
    {
        return view('competicoes.create');
    }

    public function store(CompeticaoStoreRequest $request, CloudinaryService $cloudinary)
    {
        $data = $request->validated();

        if ($request->hasFile('imagem')) {
            $data['imagem'] = $cloudinary->upload($request->file('imagem'), 'playon/competicoes');
        }

        $competicao = Competicao::create($data);

        if ($request->wantsJson()) {
            return response()->json($competicao, 201);
        }

        return redirect('/competicoes');
    }

    public function edit($id)
    {
        $competicao = Competicao::find($id);

        if ($competicao)
            return view('competicoes.edit', compact('competicao'));

        dd("Competição não encontrada!!!");
    }

    public function update(Request $request, $id, CloudinaryService $cloudinary)
    {
        $updatedCompeticao = $request->all();

        $updatedCompeticao['tipo'] = $request->has('tipo');
        $updatedCompeticao['inscricao'] = $request->has('inscricao');

        if ($request->hasFile('imagem')) {
            $updatedCompeticao['imagem'] = $cloudinary->upload($request->file('imagem'), 'playon/competicoes');
        }

        $competicaoAtual = Competicao::findOrFail($id);
        $competicaoAtual->update($updatedCompeticao);

        if ($request->wantsJson()) {
            return response()->json($competicaoAtual);
        }

        return redirect('/competicoes');
    }

    public function remove($id)
    {
        $competicao = Competicao::find($id);

        if ($competicao)
            return view('competicoes.remove', compact('competicao'));

        dd("Competição não encontrada!!!");
    }

    public function destroy(Request $request, $id)
    {
        $competicao = Competicao::findOrFail($id);

        $competicao->delete();

        if ($request->wantsJson()) {
            return response()->noContent();
        }

        return redirect('/competicoes');
    }
}
