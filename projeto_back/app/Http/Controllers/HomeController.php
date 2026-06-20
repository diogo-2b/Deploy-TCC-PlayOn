<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function index()
    {
        echo "Controller HomeController\n";
    }

    public function welcome($name = null)
    {
        $name = $name ? $name : "World";
        echo "Hello $name !!!";
    }

    public function listUsers()
    {
        $listUsuarios = Usuario::all();
        return view('usuarios.list', ['listaDeUsuarios' => $listUsuarios]);
    }
}
