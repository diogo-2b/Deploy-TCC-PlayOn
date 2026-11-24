/* global beforeEach, cy, describe, it */

import {
  entrarComoJogador,
  prepararRespostasBasicas,
} from "../support/autenticacao.js";

describe("Cadastro de equipes", () => {
  beforeEach(() => {
    prepararRespostasBasicas();
    entrarComoJogador();

    cy.visit("/equipes/cadastrar");
    cy.contains("h3", "Criando sua Equipe").should("be.visible");
  });

  it("mostra os campos obrigatórios sem enviar o formulário vazio", () => {
    cy.intercept("POST", "**/equipes").as("requisicaoCadastro");
    cy.get("#cadastrar").click();

    cy.contains("O nome é obrigatório.").should("be.visible");
    cy.contains("A descrição é obrigatória.").should("be.visible");
    cy.contains("O tipo é obrigatório.").should("be.visible");
    cy.get("@requisicaoCadastro.all").should("have.length", 0);
  });

  it("exibe a mensagem de erro quando a API rejeita o cadastro", () => {
    cy.intercept("POST", "**/equipes", {
      statusCode: 422,
      body: { message: "Não foi possível cadastrar a equipe." },
    }).as("requisicaoCadastro");

    cy.get("#nome").type("Equipe de teste");
    cy.get("#descricao").type("Equipe usada nos testes automatizados.");
    cy.get("#tipo").select("publico");
    cy.get("#cadastrar").click();

    cy.wait("@requisicaoCadastro");
    cy.contains("Não foi possível cadastrar a equipe.").should("be.visible");
  });

  it("confirma o cadastro e abre a listagem de equipes", () => {
    cy.intercept("POST", "**/equipes", {
      statusCode: 201,
      body: { data: { id: 10, nome: "Equipe de teste" } },
    }).as("requisicaoCadastro");

    cy.get("#nome").type("Equipe de teste");
    cy.get("#descricao").type("Equipe usada nos testes automatizados.");
    cy.get("#tipo").select("publico");
    cy.get("#cadastrar").click();

    cy.wait("@requisicaoCadastro");
    cy.contains("Cadastro realizado com sucesso!").should("be.visible");
    cy.location("pathname").should("eq", "/equipes");
  });
});
