<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>

<body>
    <h1>Insert new Equipe</h1>
    <form action="/equipe" method="POST">
        @csrf
        {{-- <  input type="hidden" name="_token" value="{{csrf_token()}}"/> --}}
        <table>
            <input type="hidden" name="administrador" value="1"/></td>
            <input type="hidden" name="tipo" value="false"/></td>
            <input type="hidden" name="imagem" value="foto.png"/></td>
            <tr>
                <td>Nome:</td>
                <td><input type="text" name="nome"/></td>
            </tr>
            <tr>
                <td>Descricao:</td>
                <td><textarea name="descricao" id="" cols="30" rows="10"></textarea></td>
            </tr>
            <tr align="center">
                <td colspan="2"><input type="submit" value="Criar"/></td>
            </tr>
            <tr align="center">
                <td colspan="2"><a href="/equipes" style="display: inline">&#9664;&nbsp;Voltar</a></td>
            </tr>
        </table>
    </form>
</body>

</html>
