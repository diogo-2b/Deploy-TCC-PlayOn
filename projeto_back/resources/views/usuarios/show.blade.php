<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Usuario</title>
</head>
<body>
    @if ($usuario)
        <h1>{{ $usuario->apelido }}</h1>
        <p>{{ $usuario->nome }}</p>
        <p>{{ $usuario->email }}</p>
        <a href="{{route('usuario.edit',$usuario->id)}}">Editar</a>
    @else
        <p>Usuario não encontrada! </p>
    @endif
    <a href="/usuarios">&#9664;Voltar</a>
    <a href="{{route('usuario.remove', $usuario->id) }}">Deletar</a>
</body>
</html>
