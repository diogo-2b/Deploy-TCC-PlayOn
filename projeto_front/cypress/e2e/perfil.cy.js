/* global beforeEach, cy, describe, it */

import {
  entrarComoJogador,
  prepararRespostasBasicas,
} from "../support/autenticacao.js";

describe("Alteração de perfil", () => {
  beforeEach(() => {
    prepararRespostasBasicas();
    cy.intercept("GET", "**/usuarios/1/perfil", {
      statusCode: 200,
      body: { equipes: [], competicoes: [] },
    });
    cy.intercept("GET", "**/meu-historico-competicoes", {
      statusCode: 200,
      body: [],
    });
    cy.intercept("GET", "**/steam/status", {
      statusCode: 200,
      body: { id: 1, steam: null },
    });

    entrarComoJogador();
    cy.visit("/perfil");
    cy.contains("label", "Nome:").should("be.visible");
  });

  it("carrega os dados do usuário e mantém o e-mail bloqueado para edição", () => {
    cy.contains("label", "Nome:")
      .next("input")
      .should("have.value", "Jogador de Teste");
    cy.contains("label", "Email:")
      .next("input")
      .should("have.value", "jogador@exemplo.com")
      .and("be.disabled");
    cy.contains("label", "Apelido:")
      .next("input")
      .should("have.value", "jogador_teste");
  });

  it("mostra os erros de validação devolvidos ao atualizar o perfil", () => {
    cy.intercept("POST", "**/usuarios/1", {
      statusCode: 422,
      body: {
        errors: { apelido: ["Este apelido já está em uso."] },
      },
    }).as("requisicaoAtualizacao");

    cy.contains("label", "Apelido:")
      .next("input")
      .clear()
      .type("apelido_existente");
    cy.contains("button", "Salvar mudanças").click();

    cy.wait("@requisicaoAtualizacao");
    cy.contains("Este apelido já está em uso.").should("be.visible");
  });

  it("salva as alterações e recarrega os dados atualizados", () => {
    cy.intercept("POST", "**/usuarios/1", {
      statusCode: 200,
      body: {
        id: 1,
        nome: "Nome Atualizado",
        apelido: "novo_apelido",
        email: "jogador@exemplo.com",
      },
    }).as("requisicaoAtualizacao");

    cy.contains("label", "Nome:")
      .next("input")
      .clear()
      .type("Nome Atualizado");
    cy.contains("label", "Apelido:")
      .next("input")
      .clear()
      .type("novo_apelido");
    cy.contains("button", "Salvar mudanças").click();

    cy.wait("@requisicaoAtualizacao");
    cy.contains("label", "Nome:")
      .next("input")
      .should("have.value", "Nome Atualizado");
    cy.contains("label", "Apelido:")
      .next("input")
      .should("have.value", "novo_apelido");
  });
});
