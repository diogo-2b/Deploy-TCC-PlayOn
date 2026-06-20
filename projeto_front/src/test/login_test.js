//teste da função de login
export function fazerLogin(email, senha) {
    if (email === "teste@teste.com" && senha === "1234") {
        return { sucesso: true, mensagem: "Login Bem-Sucedido!" };
    } else {
        return { sucesso: false, mensagem: "Erro no Login!" };
    }
}