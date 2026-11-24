/* global beforeEach, cy, describe, it */

import {
  entrarComoJogador,
  prepararRespostasBasicas,
} from "../support/autenticacao.js";

describe("Conexão com a Steam", () => {
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

    entrarComoJogador();
  });

  it("informa o erro ao iniciar a vinculação da conta", () => {
    cy.intercept("GET", "**/steam/status", {
      statusCode: 200,
      body: { id: 1, steam: null },
    });
    cy.intercept("GET", "**/steam/start", {
      statusCode: 503,
      body: { message: "O serviço da Steam está indisponível." },
    }).as("requisicaoVinculacao");

    cy.visit("/perfil");
    cy.contains("button", "Vincular conta Steam").click();

    cy.wait("@requisicaoVinculacao");
    cy.contains("O serviço da Steam está indisponível.").should("be.visible");
  });

  it("exibe os dados da conta vinculada e permite desvinculá-la", () => {
    let contaSteam = {
      steam_id: "76561198000000000",
      personaname: "Jogador Steam",
      profile_url: "https://steamcommunity.com/id/jogador",
      avatar: "/imagens/foto.png",
      personastate: 1,
    };
    cy.intercept("GET", "**/steam/status", (requisicao) => {
      requisicao.reply({
        statusCode: 200,
        body: { id: 1, steam: contaSteam },
      });
    });
    cy.intercept("GET", "**/usuarios/1/steam/recentes", {
      statusCode: 200,
      body: {
        games: [
          {
            appid: 10,
            name: "Jogo da Steam",
            playtime_forever: 90,
            playtime_2weeks: 30,
          },
        ],
      },
    });
    cy.intercept("DELETE", "**/steam/link", (requisicao) => {
      contaSteam = null;
      requisicao.reply({
        statusCode: 200,
        body: { user: { data: { id: 1, nome: "Jogador de Teste", steam: null } } },
      });
    }).as("requisicaoDesvinculacao");
    cy.on("window:confirm", () => true);

    cy.visit("/perfil");
    cy.contains("Jogador Steam").should("be.visible");
    cy.contains("Estado: Online").should("be.visible");
    cy.contains("Jogo da Steam").should("be.visible");
    cy.contains("Total jogado: 1h 30min").should("be.visible");

    cy.contains("a", "Abrir perfil Steam").focus();
    cy.get('[role="dialog"][aria-label="Mini perfil Steam de Jogador Steam"]')
      .should("be.visible");

    cy.contains("button", "Desvincular").click();
    cy.wait("@requisicaoDesvinculacao");
    cy.contains("Conta Steam desvinculada.").should("be.visible");
    cy.contains("button", "Vincular conta Steam").should("be.visible");
  });

  it("apresenta o aviso quando a autenticação Steam é cancelada", () => {
    cy.intercept("GET", "**/steam/status", {
      statusCode: 200,
      body: { id: 1, steam: null },
    });

    cy.visit("/perfil?steam=cancelled");

    cy.contains("A autenticação Steam foi cancelada.").should("be.visible");
  });

  it("confirma a vinculação ao retornar da autenticação Steam", () => {
    cy.intercept("GET", "**/steam/status", {
      statusCode: 200,
      body: {
        id: 1,
        steam: {
          personaname: "Jogador Steam",
          profile_url: "https://steamcommunity.com/id/jogador",
          personastate: 1,
        },
      },
    });

    cy.visit("/perfil?steam=linked");

    cy.contains("Conta Steam vinculada com sucesso.").should("be.visible");
    cy.contains("Jogador Steam").should("be.visible");
  });
});
