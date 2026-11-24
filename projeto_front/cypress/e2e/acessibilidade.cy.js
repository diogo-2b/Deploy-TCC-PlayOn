/* global beforeEach, cy, describe, expect, it */

import {
  entrarComoJogador,
  prepararRespostasBasicas,
} from "../support/autenticacao.js";

const criteriosWcag = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

function injetarAxe() {
  cy.readFile("node_modules/axe-core/axe.min.js").then((fonte) => {
    cy.window().then((janela) => {
      const script = janela.document.createElement("script");
      script.textContent = fonte;
      janela.document.head.appendChild(script);
      expect(janela.axe).to.exist;
    });
  });
}

function verificarAcessibilidade() {
  cy.window().then((janela) =>
    janela.axe
      .run(janela.document, {
        runOnly: { type: "tag", values: criteriosWcag },
      })
      .then(({ violations }) => {
        const detalhes = violations
          .map((violacao) => {
            const elementos = violacao.nodes
              .map((no) => no.target.join(", "))
              .join("; ");
            return `${violacao.impact}: ${violacao.help} (${elementos})`;
          })
          .join("\n");

        expect(violations, detalhes).to.have.length(0);
      }),
  );
}

describe("Acessibilidade das telas principais", () => {
  it("não apresenta violações WCAG 2.1 AA na tela de acesso", () => {
    cy.visit("/login");

    injetarAxe();
    verificarAcessibilidade();
  });

  describe("Telas autenticadas", () => {
    beforeEach(() => {
      prepararRespostasBasicas();
      entrarComoJogador();
    });

    it("não apresenta violações WCAG 2.1 AA no cadastro de equipe", () => {
      cy.visit("/equipes/cadastrar");
      cy.contains("h3", "Criando sua Equipe").should("be.visible");

      injetarAxe();
      verificarAcessibilidade();
    });

    it("não apresenta violações WCAG 2.1 AA no cadastro de competição", () => {
      cy.visit("/competicoes/cadastrar");
      cy.contains("h3", "Criando sua Competição").should("be.visible");

      injetarAxe();
      verificarAcessibilidade();
    });

    it("não apresenta violações WCAG 2.1 AA no cadastro de sessão", () => {
      cy.visit("/sessoes/cadastrar");
      cy.contains("h3", "Criando sua Sessão").should("be.visible");

      injetarAxe();
      verificarAcessibilidade();
    });

    it("não apresenta violações WCAG 2.1 AA na página inicial", () => {
      cy.visit("/home");
      cy.contains("h2", "Competições").should("be.visible");

      injetarAxe();
      verificarAcessibilidade();
    });

    it("não apresenta violações WCAG 2.1 AA na edição do próprio perfil", () => {
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

      cy.visit("/perfil");
      cy.contains("label", "Nome:").should("be.visible");

      injetarAxe();
      verificarAcessibilidade();
    });

    it("não apresenta violações WCAG 2.1 AA na visualização de perfil", () => {
      cy.intercept("GET", "**/usuarios/2/perfil", {
        statusCode: 200,
        body: {
          usuario: {
            id: 2,
            nome: "Jogador Visitado",
            apelido: "jogador_visitado",
            email: "visitado@exemplo.com",
          },
          equipes: [],
          competicoes: [],
        },
      });

      cy.visit("/perfil/2");
      cy.contains("h1", "Jogador Visitado").should("be.visible");

      injetarAxe();
      verificarAcessibilidade();
    });

    it("não apresenta violações WCAG 2.1 AA no painel do chat", () => {
      cy.intercept("GET", "**/api/v1/sessoes/42", {
        statusCode: 200,
        body: {
          id: 42,
          titulo: "Sessão para verificar acessibilidade",
          descricao: "Sessão de teste do painel do chat.",
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

      cy.visit("/sessoes/42");
      cy.contains("h2", "Alterar Sessão").should("be.visible");
      cy.get('[aria-label="Abrir chat"]').click();
      cy.wait("@requisicaoTokenChat");
      cy.contains("Não foi possível conectar ao chat.").should("be.visible");

      injetarAxe();
      verificarAcessibilidade();
    });
  });
});
