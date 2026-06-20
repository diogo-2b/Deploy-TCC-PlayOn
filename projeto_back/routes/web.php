<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\EquipeController;
use App\Http\Controllers\CompeticaoController;
use App\Http\Controllers\UsuarioController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('ola', function () {
    echo "Hola Mundo !!!";
});


Route::get('ola', [
    HomeController::class,
    'index'
]);

Route::get('greetings', 'App\Http\Controllers\HomeController@welcome');

Route::get('greetings/{name?}', 'App\Http\Controllers\HomeController@welcome');

Route::get('listusers', [HomeController::class, 'listUsers']);


//Minhas Rotas
//Rotas de Equipe
Route::controller(EquipeController::class)->group(function () {
    Route::prefix('/equipes')->group(function () {
        Route::get('/', [EquipeController::class, 'index'])->name('equipe.index');
    });

    Route::prefix('/equipe')->group(function () {
        Route::get('/{id}', [EquipeController::class, 'show'])->name('equipe.show');
        Route::get('/', [EquipeController::class, 'create'])->name('equipe.create');
        Route::post('/', [EquipeController::class, 'store'])->name('equipe.store');
        Route::get('/{id}/edit', [EquipeController::class, 'edit'])->name('equipe.edit');
        Route::post('/{id}/edit', [EquipeController::class, 'update'])->name('equipe.update');
        Route::get('/{id}/remove', [EquipeController::class, 'remove'])->name('equipe.remove');
        Route::post('/{id}/delete', [EquipeController::class, 'destroy'])->name('equipe.destroy');
    });
});

//Rotas de Competicao
Route::controller(CompeticaoController::class)->group(function () {
    Route::prefix('/competicoes')->group(function () {
        Route::get('/', [CompeticaoController::class, 'index'])->name('competicao.index');
    });

    Route::prefix('/competicao')->group(function () {
        Route::get('/{id}', [CompeticaoController::class, 'show'])->name('competicao.show');
        Route::get('/', [CompeticaoController::class, 'create'])->name('competicao.create');
        Route::post('/', [CompeticaoController::class, 'store'])->name('competicao.store');
        Route::get('/{id}/edit', [CompeticaoController::class, 'edit'])->name('competicao.edit');
        Route::post('/{id}/edit', [CompeticaoController::class, 'update'])->name('competicao.update');
        Route::get('/{id}/remove', [CompeticaoController::class, 'remove'])->name('competicao.remove');
        Route::post('/{id}/delete', [CompeticaoController::class, 'destroy'])->name('competicao.destroy');
    });
});

//Rotas de Usuario
Route::controller(UsuarioController::class)->group(function () {
    Route::prefix('/usuarios')->group(function () {
        Route::get('/', [UsuarioController::class, 'index'])->name('usuario.index');
    });

    Route::prefix('/usuario')->group(function () {
        Route::get('/{id}', [UsuarioController::class, 'show'])->name('usuario.show');
        Route::get('/', [UsuarioController::class, 'create'])->name('usuario.create');
        Route::post('/', [UsuarioController::class, 'store'])->name('usuario.store');
        Route::get('/{id}/edit', [UsuarioController::class, 'edit'])->name('usuario.edit');
        Route::post('/{id}/edit', [UsuarioController::class, 'update'])->name('usuario.update');
        Route::get('/{id}/remove', [UsuarioController::class, 'remove'])->name('usuario.remove');
        Route::post('/{id}/delete', [UsuarioController::class, 'destroy'])->name('usuario.destroy');
    });
});
