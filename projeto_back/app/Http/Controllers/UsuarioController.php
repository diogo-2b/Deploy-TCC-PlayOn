<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use App\Http\Requests\UsuarioStoreRequest;
use App\Http\Requests\UsuarioUpdateRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;
use App\Services\CloudinaryService;

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

    public function store(UsuarioStoreRequest $request, CloudinaryService $cloudinary)
    {
        $data = $request->validated();

        if ($request->hasFile('imagem')) {
            $data['imagem'] = $cloudinary->upload($request->file('imagem'), 'playon/usuarios');
        }

        $usuario = Usuario::create($data);

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


    public function update(Request $request, $id, CloudinaryService $cloudinary)
    {
        $updatedUsuario = $request->all();

        if ($request->hasFile('imagem')) {
            $updatedUsuario['imagem'] = $cloudinary->upload($request->file('imagem'), 'playon/usuarios');
        }

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
