<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Competição</title>
</head>
<body>
    <form action="{{route('competicao.destroy',$competicao->id)}}" method="POST">
        @csrf
        <table>
            <tr>
                <td>Nome:</td>
                <td><input type="text" name="nome" value="{{$competicao->nome}}" readonly/></td>
            </tr>
            <tr>
                <td>Descricao:</td>
                <td><textarea name="descricao" id="" cols="30" rows="10" readonly>{{$competicao->descricao}}</textarea></td>
            </tr>
            <tr>
                <td>Codigo do Dono:</td>
                <td><input type="text" name="dono" value="{{$competicao->dono}}" readonly/></td>
            </tr>
            <tr>
                <td>Tipo:</td>
                <td><input type="checkbox" name="tipo" {{($competicao->tipo)?'checked':''}} disabled/></td>
            </tr>
            <tr>
                <td>Inscricao:</td>
                <td><input type="checkbox" name="inscricao" {{($competicao->inscricao)?'checked':''}} disabled/></td>
            </tr>
            <tr align="center">
                <td colspan="2">
                    <input type="submit" value="Confirmar Deleção"/>
                    <a href="/competicoes"><button form=cancel >Cancelar</button></a>
                </td>
            </tr>
        </table>
    </form>
</body>
</html>
