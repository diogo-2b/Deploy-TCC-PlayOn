<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Competição</title>
</head>
<body>
    @if ($competicao)
        <h1>{{ $competicao->imagem }}</h1>
        <h1>{{ $competicao->nome }}</h1>
        <p>{{ $competicao->descricao }}</p>
        <li>Tipo: {{ $competicao->tipo ? 'Privado' : 'Público' }}</li>
        <li>Inscricao: {{ $competicao->inscricao ? 'Equipe' : 'Privado' }}</li>
        <a href="{{route('competicao.edit',$competicao->id)}}">Editar</a>
    @else
        <p>Competição não encontrada! </p>
    @endif
    <a href="/competicoes">&#9664;Voltar</a>
    <a href="{{route('competicao.remove', $competicao->id) }}">Deletar</a>
</body>
</html>
