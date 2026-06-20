<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Equipe</title>
</head>
<body>
    @if ($equipe)
        <h1>{{ $equipe->imagem }}</h1>
        <h1>{{ $equipe->nome }}</h1>
        <p>{{ $equipe->descricao }}</p>
        <li>Tipo: {{ $equipe->tipo ? 'Privado' : 'Público' }}</li>
        <a href="{{route('equipe.edit',$equipe->id)}}">Editar</a>
    @else
        <p>Equipe não encontrada! </p>
    @endif
    <a href="/equipes">&#9664;Voltar</a>
    <a href="{{route('equipe.remove', $equipe->id) }}">Deletar</a>
</body>
</html>
