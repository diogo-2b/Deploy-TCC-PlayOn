import { describe, expect, test } from 'vitest'
import { fazerLogin } from './login_test.js'

describe("Teste de login com Vitest", () => {
    test("Deve logar para credenciais válidas", () => {
        
        const email = "teste@teste.com";
        const senha = "1234";
        const resultadoEsperado = {
            sucesso: true,
            mensagem: "Login Bem-Sucedido!",
        };

        const resultado = fazerLogin(email, senha);

        expect(resultado).toEqual(resultadoEsperado);
    });

    test("Deve falhar, uso de senha incorreta", () => {
        
        const email = "teste@teste.com";
        const senha = "Erro";
        const resultadoEsperado = {
            sucesso: false,
            mensagem: "Erro no Login!",
        };

        const resultado = fazerLogin(email, senha);

        expect(resultado.sucesso).toBe(resultadoEsperado.sucesso);
        expect(resultado.mensagem).toContain(resultadoEsperado.mensagem);
    });
});