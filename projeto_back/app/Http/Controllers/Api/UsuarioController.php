<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\FirebaseUsuarioStoreRequest;
use App\Models\Usuario;
use App\Http\Requests\UsuarioStoreRequest;
use App\Http\Requests\UsuarioUpdateRequest;
use App\Http\Resources\UsuarioResource;
use App\Services\FirebaseService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
class UsuarioController extends Controller
{
    public function index()
    {
        return UsuarioResource::collection(Usuario::all());
    }

    public function show($id)
    {
        return new UsuarioResource(Usuario::findOrFail($id));
    }

    public function store(UsuarioStoreRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('imagem')) {
            $path = $request->file('imagem')->store('usuarios', 'public');
            $data['imagem'] = basename($path);
        }

        if (isset($data['password'])) {
            $data['password'] = bcrypt($data['password']);
        }

        $usuario = Usuario::create($data);

        return (new UsuarioResource($usuario))->response()->setStatusCode(201);
    }

    public function storeFromFirebase(FirebaseUsuarioStoreRequest $request, FirebaseService $firebase)
    {
        $data = $request->validated();

        try {
            $verifiedToken = $firebase->verifyToken($data['firebase_token']);
        } catch (\Throwable $exception) {
            return response()->json([
                'message' => 'Token do Firebase inválido ou expirado.',
            ], 401);
        }

        $claims = $verifiedToken->claims();
        $email = $claims->get('email');
        $firebaseUid = $claims->get('sub');
        $emailVerified = $claims->get('email_verified');

        if (!$email || !$firebaseUid) {
            return response()->json([
                'message' => 'Não foi possível identificar a conta do Firebase.',
            ], 401);
        }

        $usuario = Usuario::where('email', $email)->first();

        if ($usuario && $usuario->firebase_uid && $usuario->firebase_uid !== $firebaseUid) {
            return response()->json([
                'message' => 'Esse e-mail já está vinculado a outra conta Firebase.',
            ], 409);
        }

        $payload = [
            'nome' => $data['nome'],
            'apelido' => $data['apelido'],
            'email' => $email,
            'firebase_uid' => $firebaseUid,
            'password' => Hash::make($data['password'] ?? ''),
            'email_verified_at' => $emailVerified ? now() : null,
        ];

        if ($request->hasFile('imagem')) {
            $path = $request->file('imagem')->store('usuarios', 'public');
            $payload['imagem'] = basename($path);
        }

        if ($usuario) {
            $usuario->fill($payload);
            $usuario->save();
        } else {
            $usuario = Usuario::create($payload);
        }

        $token = $usuario->createToken($usuario->email, [])->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => new UsuarioResource($usuario->fresh()),
        ], 201);
    }

    public function update(UsuarioUpdateRequest $request, $id)
    {
        $usuario = Usuario::findOrFail($id);
        $data = $request->validated();

        // Processar upload de imagem se houver
        if ($request->hasFile('imagem')) {
            $path = $request->file('imagem')->store('usuarios', 'public');
            $data['imagem'] = basename($path);
        }

        if (isset($data['password'])) {
            $data['password'] = bcrypt($data['password']);
        }

        $usuario->update($data);

        return new UsuarioResource($usuario->fresh());
    }

    public function minhasEquipes(Request $request)
    {
        $usuario = $request->user();

        if (!$usuario) {
            return response()->json(['message' => 'Usuário não autenticado.'], 401);
        }

        return response()->json($usuario->equipes()->orderBy('nome')->get());
    }

    public function destroy(Request $request, string $id, FirebaseService $firebase)
    {
        $usuario = Usuario::findOrFail($id);

        if (!$request->user()) {
            return response()->json([
                'message' => 'Usuário não autenticado.'
            ], 401);
        }

        // Permitir que usuário delete apenas a si mesmo
        if ($request->user()->id !== $usuario->id) {
            return response()->json([
                'message' => 'Usuário só pode deletar a si mesmo.'
            ], 403);
        }

        $firebaseRecord = null;

        try {
            if (!empty($usuario->firebase_uid)) {
                $firebaseRecord = $firebase->getUser($usuario->firebase_uid);
            } elseif (!empty($usuario->email)) {
                $firebaseRecord = $firebase->getUserByEmail($usuario->email);
            }
        } catch (\Throwable $exception) {
            $firebaseRecord = null;
        }

        if ($firebaseRecord) {
            try {
                $firebase->deleteUser($firebaseRecord->uid);
            } catch (\Throwable $exception) {
                return response()->json([
                    'message' => 'Não foi possível remover o usuário do Firebase Auth.',
                ], 500);
            }
        }

        $usuario->delete();

        return response()->noContent();
    }
}
