/* global Cypress, cy */

Cypress.on("uncaught:exception", (error) => {
  if (error.message.includes("ResizeObserver loop completed with undelivered notifications")) {
    return false;
  }
});

export function prepararRespostasBasicas() {
  cy.intercept("GET", "**/competicoes", { statusCode: 200, body: [] });
  cy.intercept("GET", "**/equipes", { statusCode: 200, body: [] });
  cy.intercept("GET", "**/sessoes", { statusCode: 200, body: [] });
  cy.intercept("GET", "**/usuarios/busca", { statusCode: 200, body: [] });
}

export function entrarComoJogador() {
  cy.intercept("POST", "**/auth/login", {
    statusCode: 200,
    body: {
      token: "token-de-teste",
      user: {
        id: 1,
        nome: "Jogador de Teste",
        apelido: "jogador_teste",
        email: "jogador@exemplo.com",
      },
    },
  }).as("requisicaoLogin");

  cy.visit("/login");
  cy.get("#email").type("jogador@exemplo.com");
  cy.get("#senha").type("senha-de-teste");
  cy.contains("button", "Entrar").click();
  cy.wait("@requisicaoLogin");
}
