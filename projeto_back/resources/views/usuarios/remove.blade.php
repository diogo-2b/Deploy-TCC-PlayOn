<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Usuario</title>
</head>
<body>
    <form action="{{route('usuario.destroy',$usuario->id)}}" method="POST">
        @csrf
        <table>
            <tr>
                <td>Apelido:</td>
                <td><input type="text" name="apelido" value="{{$usuario->apelido}}" readonly/></td>
            </tr>
            <tr>
                <td>Nome:</td>
                <td><input type="text" name="nome" value="{{$usuario->nome}}" readonly/></td>
            </tr>
            <tr>
                <td>Email:</td>
                <td><input type="text" name="email" value="{{$usuario->email}}" readonly/></td>
            </tr>
            <tr align="center">
                <td colspan="2">
                    <input type="submit" value="Confirmar Deleção"/>
                    <a href="/usuarios"><button form=cancel >Cancelar</button></a>
                </td>
            </tr>
        </table>
    </form>
</body>
</html>
