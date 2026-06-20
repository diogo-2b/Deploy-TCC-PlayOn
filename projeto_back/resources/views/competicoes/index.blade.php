<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lista de Equipes</title>
</head>

<body>
    <h1>Competições</h1>
    <a href="/competicao">Criar Nova Competição</a>
    @if ($listaCompeticoes->count() > 0)
        <table>
            <thead>
                <tr>
                    <th>Id</th>
                    <th>Nome</th>
                    <th>Dono</th>
                    <th>Tipo</th>
                    <th>Descricao</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($listaCompeticoes as $competicao)
                    <tr>
                        <td><a href="{{route('competicao.show', $competicao->id) }}">{{ $competicao->id }}</a></td>
                        <td>{{ $competicao->nome }}</td>
                        <td>{{ $competicao->dono }}</td>
                        <td>{{ $competicao->inscricao ? 'Equipe' : 'Pessoa' }}</td>
                        <td>{{ $competicao->descricao }}</td>
                        <td><a href="{{route('competicao.edit',$competicao->id)}}">Editar</a></td>
                        <td><a href="{{route('competicao.remove', $competicao->id) }}">Remover</a></td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <p>Competições não Encontradas! </p>
    @endif
</body>

</html>
