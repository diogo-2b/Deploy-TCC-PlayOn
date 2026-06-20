<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Equipe</title>
</head>
<body>
    <form action="{{route('equipe.destroy',$equipe->id)}}" method="POST">
        @csrf
        <table>
            <tr>
                <td>Nome:</td>
                <td><input type="text" name="nome" value="{{$equipe->nome}}" readonly/></td>
            </tr>
            <tr>
                <td>Descricao:</td>
                <td><textarea name="descricao" id="" cols="30" rows="10" readonly>{{$equipe->descricao}}</textarea></td>
            </tr>
            <tr>
                <td>Codigo do administrador:</td>
                <td><input type="text" name="dono" value="{{$equipe->administrador}}" readonly/></td>
            </tr>
            <tr>
                <td>Tipo:</td>
                <td><input type="checkbox" name="tipo" {{($equipe->tipo)?'checked':''}} disabled/></td>
            </tr>
            <tr align="center">
                <td colspan="2">
                    <input type="submit" value="Confirmar Deleção"/>
                    <a href="/equipes"><button form=cancel >Cancelar</button></a>
                </td>
            </tr>
        </table>
    </form>
</body>
</html>
