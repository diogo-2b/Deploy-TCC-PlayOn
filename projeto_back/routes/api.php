<?php

use App\Http\Controllers\Api\CompeticaoController;
use App\Http\Controllers\Api\EquipeController;
use App\Http\Controllers\Api\UsuarioController;
use App\Http\Controllers\Api\ParticipantesEquipesController;
use App\Http\Controllers\Api\ParticipantesCompeticoesController;
use App\Http\Controllers\Api\SessaoController;
use App\Http\Controllers\Api\SessaoJogadoresController;
use App\Services\FirebaseService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;




// Rotas da API (v1)
Route::prefix('v1')->group(function () {

    Route::get('/all-headers-test', function () {
        return response()->json([
            'headers' => headers_list(),
        ]);
    });

    Route::get('/raw-header-test', function () {
        header('Access-Control-Allow-Origin: *');
        header('X-Test-Header: abc123');

        echo json_encode([
            'ok' => true,
            'headers' => headers_list(),
        ]);

        exit;
    });



    Route::apiResource('competicoes', CompeticaoController::class)->only(['index', 'show']);
    Route::apiResource('equipes', EquipeController::class)->only(['index', 'show']);
    Route::apiResource('usuarios', UsuarioController::class)->only(['store']);
    Route::post('usuarios/firebase', [UsuarioController::class, 'storeFromFirebase']);
    Route::apiResource('sessoes', SessaoController::class)->only(['index', 'show']);


    Route::middleware('auth:sanctum')->group(function () {
        Route::apiResource('competicoes', CompeticaoController::class)->only(['store', 'update', 'destroy']);
        Route::apiResource('equipes', EquipeController::class)->only(['store', 'update', 'destroy']);
        Route::apiResource('usuarios', UsuarioController::class)->except(['store']);
        Route::get('minhas-equipes', [UsuarioController::class, 'minhasEquipes']);
        Route::apiResource('sessoes', SessaoController::class)->only(['store', 'update', 'destroy']);

        // Rotas de participação em equipes
        Route::post('equipes/{equipaId}/membros', [ParticipantesEquipesController::class, 'store']);
        Route::get('equipes/{equipaId}/membros', [ParticipantesEquipesController::class, 'index']);
        Route::get('membros/{id}', [ParticipantesEquipesController::class, 'show']);
        Route::put('membros/{id}', [ParticipantesEquipesController::class, 'update']);
        Route::delete('membros/{id}', [ParticipantesEquipesController::class, 'destroy']);
        Route::post('equipes/{equipaId}/sair', [ParticipantesEquipesController::class, 'sair']);

        // Rotas de participação em competições
        Route::post('competicoes/{competicaoId}/participantes', [ParticipantesCompeticoesController::class, 'store']);
        Route::get('competicoes/{competicaoId}/participantes', [ParticipantesCompeticoesController::class, 'index']);
        Route::get('participantes/{id}', [ParticipantesCompeticoesController::class, 'show']);
        Route::put('participantes/{id}', [ParticipantesCompeticoesController::class, 'update']);
        Route::delete('participantes/{id}', [ParticipantesCompeticoesController::class, 'destroy']);
        Route::post('competicoes/{competicaoId}/sair', [ParticipantesCompeticoesController::class, 'sair']);

        Route::get('/sessoes/{sessaoId}/jogadores', [SessaoJogadoresController::class, 'index']);
        Route::post('/sessoes/{sessaoId}/jogadores', [SessaoJogadoresController::class, 'store']);
        Route::delete('/sessoes/{sessaoId}/jogadores/{usuarioId}', [SessaoJogadoresController::class, 'destroy']);
    });

    Route::prefix('auth')->group(function () {
        Route::post('login', [\App\Http\Controllers\Api\Auth\LoginController::class, 'login']);
        Route::post('login/firebase', [\App\Http\Controllers\Api\Auth\LoginController::class, 'loginWithFirebase']);
        Route::post('logout', [\App\Http\Controllers\Api\Auth\LoginController::class, 'logout']);
        Route::post('refresh', [\App\Http\Controllers\Api\Auth\LoginController::class, 'refresh']);
    });

    Route::middleware('auth:sanctum')->group(function () {
        Route::apiResource('usuarios', UsuarioController::class)
            ->only(['destroy']);
    });
});
