<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lista de Equipes</title>
</head>

<body>
    <h1>Equipes</h1>
    <a href="/equipe">Criar Nova Equipe</a>
    @if ($listaEquipes->count() > 0)
        <table>
            <thead>
                <tr>
                    <th>Id</th>
                    <th>Nome</th>
                    <th>Administrador</th>
                    <th>Tipo</th>
                    <th>Descricao</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($listaEquipes as $equipe)
                    <tr>
                        <td><a href="{{route('equipe.show', $equipe->id) }}">{{ $equipe->id }}</a></td>
                        <td>{{ $equipe->nome }}</td>
                        <td>{{ $equipe->administrador }}</td>
                        <td>{{ $equipe->tipo ? 'Privado' : 'Público' }}</td>
                        <td>{{ $equipe->descricao }}</td>
                        <td><a href="{{route('equipes.edit',$equipe->id)}}">Editar</a></td>
                        <td><a href="{{route('equipe.remove', $equipe->id) }}">Remover</a></td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <p>Equipes não Encontradas! </p>
    @endif
</body>

</html>
