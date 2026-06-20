<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>

<body>
    <h1>Insert new Usuario</h1>
    <form action="{{route('usuario.update',$usuario->id)}}" method="POST">
        @csrf
        <table>
            <tr>
                <td>Apelido:</td>
                <td><input type="text" name="apelido" value="{{$usuario->apelido}}"/></td>
            </tr>
            <tr>
                <td>Nome:</td>
                <td><input type="text" name="nome" value="{{$usuario->nome}}"/></td>
            </tr>
            <tr>
                <td>Email:</td>
                <td><input type="text" name="email" value="{{$usuario->email}}"/></td>
            </tr>
            <tr align="center">
                <td colspan="2">
                    <input type="submit" value="Salvar"/>
                    <a href="/usuarios"><button form=cancel >Cancelar</button></a>
                </td>
            </tr>
        </table>
    </form>
</body>
</html>
