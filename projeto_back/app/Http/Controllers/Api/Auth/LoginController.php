<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Requests\LoginRequest;
use App\Models\Usuario;
use App\Http\Resources\UsuarioResource;
use App\Services\FirebaseService;
use Exception;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Exceptions\ExceptionJsonResponse;

class LoginController {
    public function login(LoginRequest $request): JsonResponse {
        try {
            $credentials = $request->validated();
            $user = $this->authenticate($credentials);
            if (!$user) throw new Exception("Dados inválidos!");

            if (is_null($user->email_verified_at)) {
                throw new Exception("E-mail ainda não foi verificado.");
            }

            $token = $user->createToken($user->email, [])->plainTextToken;

            return response()->json([
                'token' => $token,
                'user' => new UsuarioResource($user),
            ]);
        } catch (Exception $error) {
            return $this->errorHandler(
                $error->getMessage(),
                $error,
                401
            );
        }
    }

    public function loginWithFirebase(Request $request, FirebaseService $firebase): JsonResponse
    {
        try {
            $data = $request->validate([
                'firebase_token' => 'required|string',
            ]);

            $verifiedToken = $firebase->verifyToken($data['firebase_token']);
            $claims = $verifiedToken->claims();
            $email = $claims->get('email');
            $firebaseUid = $claims->get('sub');

            if (!$email || !$firebaseUid) {
                return response()->json([
                    'message' => 'Não foi possível identificar a conta do Firebase.'
                ], 401);
            }

            $user = Usuario::where('email', $email)->first();

            if (!$user) {
                return response()->json([
                    'message' => 'Conta não encontrada. Complete o cadastro primeiro.'
                ], 404);
            }

            if (!$user->firebase_uid || $user->firebase_uid !== $firebaseUid) {
                $user->firebase_uid = $firebaseUid;
                $user->save();
            }

            if ($claims->get('email_verified')) {
                $user->email_verified_at = now();
                $user->save();
            }

            if (is_null($user->email_verified_at)) {
                return response()->json([
                    'message' => 'E-mail ainda não foi verificado.'
                ], 403);
            }

            $token = $user->createToken($user->email, [])->plainTextToken;

            return response()->json([
                'token' => $token,
                'user' => new UsuarioResource($user),
            ]);
        } catch (Exception $error) {
            return $this->errorHandler(
                'Token do Firebase inválido ou expirado.',
                $error,
                401
            );
        }
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        $user->currentAccessToken()->delete();
        return response()->json(['Usuário desconectado!'], 200);
    }

    public function refresh(Request $request)
    {
        $user = $request->user();
        $user->currentAccessToken()->delete();
        $token = $user->createToken($user->email)->plainTextToken;
        return compact(['user', 'token']);
    }

    private function authenticate(array $credentials): Usuario | null{
        if (!isset($credentials['email'], $credentials['password'])) {
            return null;
        }

        $user = Usuario::where('email', $credentials['email'])->first();

        if (!$user) {
            return null;
        }

        if (Hash::check($credentials['password'], $user->password)) {
            Auth::login($user);
            return $user;
        }

        if (Auth::attempt($credentials)) {
            return Usuario::where('email', $credentials['email'])->first();
        }

        return null;
    }

    protected function errorHandler(
        string $message,
        Exception $exception,
        int $httpStatus = 500,
        string | null $statusCodeMsg = null
    ): JsonResponse {
        throw new ExceptionJsonResponse($message, $httpStatus, $exception, $statusCodeMsg);
    }
}
