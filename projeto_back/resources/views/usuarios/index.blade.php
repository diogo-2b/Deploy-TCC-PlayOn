<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lista de Usuarios</title>
</head>

<body>
    <h1>Usuarios</h1>
    <a href="/usuario">Criar Novo Usuario</a>
    @if ($listaUsuarios->count() > 0)
        <table>
            <thead>
                <tr>
                    <th>Id</th>
                    <th>Apelido</th>
                    <th>Nome</th>
                    <th>Email</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($listaUsuarios as $usuario)
                    <tr>
                        <td><a href="{{route('usuario.show', $usuario->id) }}">{{ $usuario->id }}</a></td>
                        <td>{{ $usuario->apelido }}</td>
                        <td>{{ $usuario->nome }}</td>
                        <td>{{ $usuario->email }}</td>
                        <td><a href="{{route('usuarios.edit',$usuario->id)}}">Editar</a></td>
                        <td><a href="{{route('usuario.remove', $usuario->id) }}">Remover</a></td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <p>Equipes não Encontradas! </p>
    @endif
</body>

</html>
