/* global beforeEach, cy, describe, it */

import {
  entrarComoJogador,
  prepararRespostasBasicas,
} from "../support/autenticacao.js";

describe("Chat da sessão", () => {
  beforeEach(() => {
    prepararRespostasBasicas();
    cy.intercept("GET", "**/api/v1/sessoes/42", {
      statusCode: 200,
      body: {
        id: 42,
        titulo: "Sessão para testar o chat",
        descricao: "Uma sessão usada nos testes de chat.",
        criador_id: 1,
        status: "aberta",
        max_jogadores: 5,
        jogo: { nome: "Jogo de Teste", igdb_id: 700 },
      },
    });
    cy.intercept("GET", "**/api/v1/sessoes/42/jogadores", {
      statusCode: 200,
      body: [{ id: 1, nome: "Jogador de Teste", apelido: "jogador_teste" }],
    });
    cy.intercept("POST", "**/auth/firebase-token", {
      statusCode: 503,
      body: { message: "O serviço do chat está indisponível." },
    }).as("requisicaoTokenChat");

    entrarComoJogador();
    cy.visit("/sessoes/42");
  });

  it("abre o painel e mostra o erro se não conseguir obter o token do chat", () => {
    cy.get('[aria-label="Abrir chat"]').click();
    cy.wait("@requisicaoTokenChat");

    cy.get('[aria-label="Fechar chat"]').should("have.attr", "aria-expanded", "true");
    cy.contains("Não foi possível conectar ao chat.").should("be.visible");
    cy.get('[aria-label="Mensagem do chat"]').should("not.exist");
  });
});
