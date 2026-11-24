/* global beforeEach, cy, describe, it */

import {
  entrarComoJogador,
  prepararRespostasBasicas,
} from "../support/autenticacao.js";

function dispararEnviosRapidos() {
  cy.get("#formCadastro").then(($form) => {
    for (let tentativa = 0; tentativa < 3; tentativa += 1) {
      $form[0].dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
    }
  });
}

describe("Proteção contra cadastros duplicados", () => {
  beforeEach(() => {
    prepararRespostasBasicas();
    entrarComoJogador();
  });

  it("cria apenas uma competição quando o formulário é enviado várias vezes", () => {
    cy.intercept("GET", "**/jogos?search=Valorant", {
      statusCode: 200,
      body: [{ igdb_id: 1001, nome: "Valorant", plataformas: ["PC"] }],
    }).as("pesquisaJogos");
    cy.intercept("POST", "**/competicoes", {
      statusCode: 201,
      delay: 500,
      body: { data: { id: 42, nome: "Liga de Valorant" } },
    }).as("criacaoCompeticao");

    cy.visit("/competicoes/cadastrar");
    cy.get("#nome").type("Liga de Valorant");
    cy.get("#descricao").type("Competição para testar envios repetidos.");
    cy.get("#data_encerramento").type("2030-01-01");
    cy.get("#tipo").select("publico");
    cy.get("#buscaJogo").type("Valorant");
    cy.wait("@pesquisaJogos");
    cy.contains("button", "Valorant").click();

    dispararEnviosRapidos();

    cy.get("@criacaoCompeticao.all").should("have.length", 1);
    cy.get("#cadastrar").should("be.disabled");
    cy.wait("@criacaoCompeticao");
  });

  it("cria apenas uma equipe quando o formulário é enviado várias vezes", () => {
    cy.intercept("POST", "**/equipes", {
      statusCode: 201,
      delay: 500,
      body: { data: { id: 10, nome: "Equipe de Teste" } },
    }).as("criacaoEquipe");

    cy.visit("/equipes/cadastrar");
    cy.get("#nome").type("Equipe de Teste");
    cy.get("#descricao").type("Equipe para testar envios repetidos.");
    cy.get("#tipo").select("publico");

    dispararEnviosRapidos();

    cy.get("@criacaoEquipe.all").should("have.length", 1);
    cy.get("#cadastrar").should("be.disabled");
    cy.wait("@criacaoEquipe");
  });

  it("cria apenas uma sessão quando o formulário é enviado várias vezes", () => {
    cy.intercept("GET", "**/jogos?search=Valorant", {
      statusCode: 200,
      body: [{ igdb_id: 1001, nome: "Valorant", plataformas: ["PC"] }],
    }).as("pesquisaJogos");
    cy.intercept("POST", "**/sessoes", {
      statusCode: 201,
      delay: 500,
      body: { id: 15, titulo: "Sessão de Teste" },
    }).as("criacaoSessao");

    cy.visit("/sessoes/cadastrar");
    cy.get("#titulo").type("Sessão de Teste");
    cy.get("#descricao").type("Sessão para testar envios repetidos.");
    cy.get("#jogo").type("Valorant");
    cy.wait("@pesquisaJogos");
    cy.contains("button", "Valorant").click();

    dispararEnviosRapidos();

    cy.get("@criacaoSessao.all").should("have.length", 1);
    cy.get("#cadastrar").should("be.disabled");
    cy.wait("@criacaoSessao");
  });
});
