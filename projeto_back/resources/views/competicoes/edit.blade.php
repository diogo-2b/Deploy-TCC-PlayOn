<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>

<body>
    <h1>Insira nova Competição</h1>
    <form action="{{route('competicao.update',$competicao->id)}}" method="POST">
        @csrf
        <table>
            <tr>
                <td>Nome:</td>
                <td><input type="text" name="nome" value="{{$competicao->nome}}"/></td>
            </tr>
            <tr>
                <td>Descricao:</td>
                <td><textarea name="descricao" id="" cols="30" rows="10">{{$competicao->descricao}}</textarea></td>
            </tr>
            <tr>
                <td>Codigo do Dono:</td>
                <td><input type="text" name="dono" value="{{$competicao->dono}}"/></td>
            </tr>
            <tr>
                <td>Tipo:</td>
                <td><input type="checkbox" name="tipo" {{($competicao->tipo)?'checked':''}}/></td>
            </tr>
            <tr>
                <td>Inscricao:</td>
                <td><input type="checkbox" name="inscricao" {{($competicao->inscricao)?'checked':''}}/></td>
            </tr>
            <tr align="center">
                <td colspan="2">
                    <input type="submit" value="Salvar"/>
                    <a href="/competicoes"><button form=cancel >Cancelar</button></a>
                </td>
            </tr>
        </table>
    </form>
</body>
</html>
