/* global beforeEach, cy, describe, it */

describe("Acesso à conta", () => {
  beforeEach(() => {
    cy.visit("/login");
  });

  it("exibe os campos de acesso e permite mostrar a senha", () => {
    cy.get("#email").should("be.visible");
    cy.get("#senha").should("have.attr", "type", "password");

    cy.get('button[aria-label="Mostrar senha"]').click();
    cy.get("#senha").should("have.attr", "type", "text");
    cy.get('button[aria-label="Ocultar senha"]').click();
    cy.get("#senha").should("have.attr", "type", "password");
  });

  it("informa quando os campos obrigatórios estão vazios", () => {
    cy.intercept("POST", "**/auth/login").as("requisicaoLogin");
    cy.contains("button", "Entrar").click();

    cy.contains("Email e senha são obrigatórios.").should("be.visible");
    cy.get("@requisicaoLogin.all").should("have.length", 0);
  });

  it("não envia os campos quando contêm apenas espaços", () => {
    cy.intercept("POST", "**/auth/login").as("requisicaoLogin");
    cy.get("#email").type("   ");
    cy.get("#senha").type("   ");
    cy.contains("button", "Entrar").click();

    cy.contains("Email e senha são obrigatórios.").should("be.visible");
    cy.get("@requisicaoLogin.all").should("have.length", 0);
  });

  it("mostra a mensagem retornada para credenciais inválidas", () => {
    cy.intercept("POST", "**/auth/login", {
      statusCode: 401,
      body: { message: "Dados inválidos!" },
    }).as("requisicaoLogin");

    cy.get("#email").type("player@example.com");
    cy.get("#senha").type("wrong-password");
    cy.contains("button", "Entrar").click();

    cy.wait("@requisicaoLogin");
    cy.contains("Dados inválidos!").should("be.visible");
  });

  it("abre as opções de confirmação quando o e-mail ainda não foi verificado", () => {
    cy.intercept("POST", "**/auth/login", {
      statusCode: 401,
      body: { message: "E-mail ainda não foi verificado." },
    }).as("requisicaoLogin");

    cy.get("#email").type("jogador@exemplo.com");
    cy.get("#senha").type("senha-de-teste");
    cy.contains("button", "Entrar").click();

    cy.wait("@requisicaoLogin");
    cy.contains("h3", "Confirme seu e-mail").should("be.visible");
    cy.contains("button", "Reenviar e-mail de verificação").should("be.visible");
    cy.contains("button", "Já confirmei o e-mail").should("be.visible");
  });

  it("leva à tela de cadastro pelo botão correspondente", () => {
    cy.contains("button", "Registre-se").click();

    cy.location("pathname").should("eq", "/cadastro");
  });

  it("leva à recuperação de senha pelo botão correspondente", () => {
    cy.contains("button", "Esqueci minha senha").click();

    cy.location("pathname").should("eq", "/recuperar-senha");
  });

  it("inicia o acesso ao pressionar Enter no campo de senha", () => {
    cy.intercept("POST", "**/auth/login", {
      statusCode: 401,
      body: { message: "Dados inválidos!" },
    }).as("requisicaoLogin");

    cy.get("#email").type("jogador@exemplo.com");
    cy.get("#senha").type("senha-de-teste{enter}");

    cy.wait("@requisicaoLogin");
    cy.contains("Dados inválidos!").should("be.visible");
  });

  it("redireciona para a área principal após autenticação", () => {
    cy.intercept("POST", "**/auth/login", {
      statusCode: 200,
      body: {
        token: "test-token",
        user: { id: 1, nome: "Jogador", email: "player@example.com" },
      },
    }).as("requisicaoLogin");
    cy.intercept("GET", "**/competicoes", { statusCode: 200, body: [] });
    cy.intercept("GET", "**/equipes", { statusCode: 200, body: [] });
    cy.intercept("GET", "**/sessoes", { statusCode: 200, body: [] });

    cy.get("#email").type("player@example.com");
    cy.get("#senha").type("correct-password");
    cy.contains("button", "Entrar").click();

    cy.wait("@requisicaoLogin");
    cy.location("pathname").should("eq", "/home");
    cy.contains("h2", "Sessões").should("be.visible");
  });
});
