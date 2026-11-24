/* global cy, describe, it */

describe("Barra de pesquisa", () => {
  it("filtra competições, equipes, usuários e sessões sem diferenciar maiúsculas", () => {
    cy.intercept("GET", "**/competicoes", {
      statusCode: 200,
      body: [{ id: 1, nome: "Arena de Outono", descricao: "Torneio aberto" }],
    });
    cy.intercept("GET", "**/equipes", {
      statusCode: 200,
      body: [{ id: 2, nome: "Equipe Arena", descricao: "Equipe de teste" }],
    });
    cy.intercept("GET", "**/sessoes", {
      statusCode: 200,
      body: [{ id: 3, titulo: "Sessão Arena", descricao: "Partida casual" }],
    });
    cy.intercept("GET", "**/usuarios/busca", {
      statusCode: 200,
      body: [{ id: 4, nome: "Jogador", apelido: "arena_player" }],
    });

    cy.visit("/");
    cy.get('[aria-label="Busca"]').type("ARENA");

    cy.get('[role="dialog"][aria-label="Resultados da busca"]').within(() => {
      cy.get('a[href="/competicao/1"]').should("contain", "Arena de Outono");
      cy.get('a[href="/equipe/2"]').should("contain", "Equipe Arena");
      cy.get('a[href="/perfil/4"]').should("contain", "Jogador");
      cy.get('a[href="/sessoes/3"]').should("contain", "Sessão Arena");
    });
  });

  it("mostra avisos quando não há correspondências", () => {
    cy.intercept("GET", "**/competicoes", { statusCode: 200, body: [] });
    cy.intercept("GET", "**/equipes", { statusCode: 200, body: [] });
    cy.intercept("GET", "**/sessoes", { statusCode: 200, body: [] });
    cy.intercept("GET", "**/usuarios/busca", { statusCode: 200, body: [] });

    cy.visit("/");
    cy.get('[aria-label="Busca"]').type("sem-resultados");

    cy.get('[role="dialog"]').within(() => {
      cy.contains("Nenhuma competição encontrada").should("be.visible");
      cy.contains("Nenhuma equipe encontrada").should("be.visible");
      cy.contains("Nenhum usuário encontrado").should("be.visible");
      cy.contains("Nenhuma sessão encontrada").should("be.visible");
    });
  });

  it("limpa a pesquisa ao pressionar Escape", () => {
    cy.intercept("GET", "**/competicoes", {
      statusCode: 200,
      body: [{ id: 1, nome: "Arena de Outono" }],
    });
    cy.intercept("GET", "**/equipes", { statusCode: 200, body: [] });
    cy.intercept("GET", "**/sessoes", { statusCode: 200, body: [] });
    cy.intercept("GET", "**/usuarios/busca", { statusCode: 200, body: [] });

    cy.visit("/");
    cy.get('[aria-label="Busca"]').type("Arena");
    cy.get('[role="dialog"]').should("be.visible");
    cy.get('[aria-label="Busca"]').type("{esc}").should("have.value", "");
    cy.get('[role="dialog"]').should("not.exist");
  });
});
