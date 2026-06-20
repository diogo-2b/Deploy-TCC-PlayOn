<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use App\Http\Requests\UsuarioStoreRequest;
use App\Http\Requests\UsuarioUpdateRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;

class UsuarioController extends Controller
{
    public function index(Request $request)
    {
        $listUsuarios = Usuario::all();

        if ($request->wantsJson()) {
            return response()->json($listUsuarios);
        }

        return View::make('usuarios.index', ["listUsuarios" => $listUsuarios]);
    }

    public function show(Request $request, $id)
    {
        $usuario = Usuario::findOrFail($id);

        if ($request->wantsJson()) {
            return response()->json($usuario);
        }

        return view('usuarios.show', ['usuario' => $usuario]);
    }

    public function create()
    {
        return view('usuarios.create');
    }

    public function store(UsuarioStoreRequest $request)
    {
        $usuario = Usuario::create($request->validated());

        if ($request->wantsJson()) {
            return response()->json($usuario, 201);
        }

        return redirect('/usuarios');
    }

    public function edit($id)
    {
        $usuario = Usuario::find($id);

        if ($usuario)
            return view('usuarios.edit', compact('usuario'));

        dd("Usuario não encontrado!!!");
    }


    public function update(Request $request, $id)
    {
        $updatedUsuario = $request->all();

        $usuarioAtual = Usuario::findOrFail($id);
        $usuarioAtual->update($updatedUsuario);

        if ($request->wantsJson()) {
            return response()->json($usuarioAtual);
        }

        return redirect('/usuarios');
    }

    public function remove($id)
    {
        $usuario = Usuario::find($id);

        if ($usuario)
            return view('usuarios.remove', compact('usuario'));

        dd("Usuario não encontrada!!!");
    }

    public function destroy(Request $request, $id)
    {
        $usuario = Usuario::findOrFail($id);

        $usuario->delete();

        if ($request->wantsJson()) {
            return response()->noContent();
        }

        return redirect('/usuarios');
    }
}
