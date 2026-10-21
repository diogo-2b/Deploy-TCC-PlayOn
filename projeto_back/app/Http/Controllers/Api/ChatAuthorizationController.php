<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ChatAuthorizationService;
use App\Services\FirebaseService;
use Illuminate\Http\Request;

class ChatAuthorizationController extends Controller
{
    public function access(
        Request $request,
        string $type,
        int $id,
        ChatAuthorizationService $authorization
    ) {
        abort_unless(in_array($type, ['equipe', 'competicao', 'sessao'], true), 404);

        $authorized = $authorization->isAuthorized($type, $id, $request->user());

        return response()->json([
            'authorized' => $authorized,
            'firebase_uid' => $authorized ? $request->user()->firebase_uid : null,
        ], $authorized ? 200 : 403);
    }

    public function firebaseToken(Request $request, FirebaseService $firebase)
    {
        abort_unless($request->user()->firebase_uid, 422, 'Usuário não vinculado ao Firebase.');

        return response()->json([
            'token' => $firebase->createCustomToken($request->user()->firebase_uid),
        ]);
    }
}
