/* global beforeEach, cy, describe, it */

import {
  entrarComoJogador,
  prepararRespostasBasicas,
} from "../support/autenticacao.js";

const jogadores = [
  { id: 11, id_participante: 101, tipo_participante: "usuario", aprovado: true, participante: { apelido: "Jogador Um" } },
  { id: 12, id_participante: 102, tipo_participante: "usuario", aprovado: true, participante: { apelido: "Jogador Dois" } },
  { id: 13, id_participante: 103, tipo_participante: "usuario", aprovado: true, participante: { apelido: "Jogador Três" } },
  { id: 14, id_participante: 104, tipo_participante: "usuario", aprovado: true, participante: { apelido: "Jogador Quatro" } },
];

const competenciaBase = (alteracoes = {}) => ({
  id: 42,
  codigo: 42,
  dono: 1,
  nome: "Campeonato de Teste",
  descricao: "Competição usada nos testes.",
  data_encerramento: "2030-01-01",
  tipo: true,
  inscricao: false,
  modo: "personalizado",
  encerrada: false,
  jogo: { id: 7, nome: "Jogo de Teste", igdb_id: 700 },
  ...alteracoes,
});

const resultadosVazios = (modo = "personalizado", formato = null) => ({
  configuracao: { modo, formato, quantidade_participantes: 4, numero_rodadas: 1 },
  partidas: [],
  classificacao: [],
  podio: {
    primeiro_lugar: null,
    segundo_lugar: null,
    terceiro_lugar: null,
  },
});

function prepararDetalhesDaCompeticao({
  competencia = competenciaBase(),
  participantes = [],
  resultados = resultadosVazios(competencia.modo, competencia.formato),
} = {}) {
  cy.intercept("GET", "**/competicoes/42", {
    statusCode: 200,
    body: competencia,
  });
  cy.intercept("GET", "**/competicoes/42/participantes*", {
    statusCode: 200,
    body: participantes,
  });
  cy.intercept("GET", "**/competicoes/42/resultados", {
    statusCode: 200,
    body: resultados,
  });
}

describe("Cadastro de competições", () => {
  beforeEach(() => {
    prepararRespostasBasicas();
    entrarComoJogador();
    cy.visit("/competicoes/cadastrar");
    cy.contains("h3", "Criando sua Competição").should("be.visible");
  });

  it("aponta os campos obrigatórios e não envia um cadastro incompleto", () => {
    cy.intercept("POST", "**/competicoes").as("requisicaoCadastro");
    cy.get("#cadastrar").click();

    cy.contains("O nome é obrigatório.").should("be.visible");
    cy.contains("A descrição é obrigatória.").should("be.visible");
    cy.contains("A data de encerramento é obrigatória.").should("be.visible");
    cy.contains("O tipo é obrigatório.").should("be.visible");
    cy.contains("Selecione um jogo do catálogo.").should("be.visible");
    cy.get("@requisicaoCadastro.all").should("have.length", 0);
  });

  it("pesquisa jogos no catálogo, seleciona um resultado e permite trocá-lo", () => {
    cy.intercept("GET", "**/jogos?search=Valorant", {
      statusCode: 200,
      body: [
        {
          igdb_id: 1001,
          nome: "Valorant",
          capa_url: null,
          plataformas: ["PC"],
        },
      ],
    }).as("pesquisaJogos");

    cy.get("#buscaJogo").type("Valorant");
    cy.wait("@pesquisaJogos");
    cy.contains("button", "Valorant").click();

    cy.contains("Jogo selecionado").should("be.visible");
    cy.contains("ID IGDB: 1001").should("be.visible");
    cy.contains("button", "Trocar").click();
    cy.get("#buscaJogo").should("have.value", "");
    cy.contains("Jogo selecionado").should("not.exist");
  });

  it("cria uma competição estruturada por pontos após selecionar um jogo", () => {
    cy.intercept("GET", "**/jogos?search=Valorant", {
      statusCode: 200,
      body: [{ igdb_id: 1001, nome: "Valorant", plataformas: ["PC"] }],
    }).as("pesquisaJogos");
    cy.intercept("POST", "**/competicoes", {
      statusCode: 201,
      body: { data: { id: 42, nome: "Liga de Valorant" } },
    }).as("requisicaoCadastro");

    cy.get("#nome").type("Liga de Valorant");
    cy.get("#descricao").type("Competição por pontos para os testes.");
    cy.get("#data_encerramento").type("2030-01-01");
    cy.get("#tipo").select("publico");
    cy.get("#inscricao").select("pessoa");
    cy.get("#modo").select("estruturado");
    cy.get("#formato").select("pontos");
    cy.contains("label", "Número de participantes")
      .find("input")
      .clear()
      .type("3");
    cy.contains("label", "Número de rodadas")
      .find("input")
      .clear()
      .type("2");

    cy.get("#buscaJogo").type("Valorant");
    cy.wait("@pesquisaJogos");
    cy.contains("button", "Valorant").click();
    cy.get("#cadastrar").click();

    cy.wait("@requisicaoCadastro")
      .its("request.headers.content-type")
      .should("include", "multipart/form-data");
    cy.contains("Cadastro realizado com sucesso!").should("be.visible");
    cy.location("pathname").should("eq", "/competicoes");
  });
});

describe("Inscrições e resultados de competições", () => {
  beforeEach(() => {
    prepararRespostasBasicas();
    entrarComoJogador();
  });

  it("inscreve o usuário em uma competição pública e atualiza o status", () => {
    const competencia = competenciaBase({ dono: 2 });
    let inscricao = [];
    prepararDetalhesDaCompeticao({ competencia });
    cy.intercept("GET", "**/competicoes/42/participantes*", (requisicao) => {
      requisicao.reply({ statusCode: 200, body: inscricao });
    });
    cy.intercept("POST", "**/competicoes/42/participantes", (requisicao) => {
      inscricao = [{
        id: 21,
        id_competicao: 42,
        id_participante: 1,
        tipo_participante: "usuario",
        aprovado: true,
      }];
      requisicao.reply({ statusCode: 201, body: inscricao[0] });
    }).as("requisicaoInscricao");

    cy.visit("/competicao/42");
    cy.contains("button", "Inscrever-se").click();
    cy.wait("@requisicaoInscricao")
      .its("request.body")
      .should("deep.equal", {
        id_competicao: "42",
        id_participante: 1,
        tipo_participante: "usuario",
      });

    cy.contains("Inscrição realizada com sucesso!").should("be.visible");
    cy.contains("button", "Sair da competição").should("be.visible");
  });

  it("permite cancelar uma solicitação pendente de competição privada", () => {
    const competencia = competenciaBase({ dono: 2, tipo: false });
    let inscricao = [];
    prepararDetalhesDaCompeticao({ competencia });
    cy.intercept("GET", "**/competicoes/42/participantes*", (requisicao) => {
      requisicao.reply({ statusCode: 200, body: inscricao });
    });
    cy.intercept("POST", "**/competicoes/42/participantes", (requisicao) => {
      inscricao = [{
        id: 22,
        id_competicao: 42,
        id_participante: 1,
        tipo_participante: "usuario",
        aprovado: false,
      }];
      requisicao.reply({ statusCode: 201, body: inscricao[0] });
    }).as("requisicaoInscricao");
    cy.intercept("POST", "**/competicoes/42/sair", (requisicao) => {
      inscricao = [];
      requisicao.reply({
        statusCode: 200,
        body: { message: "Desinscrição realizada com sucesso" },
      });
    }).as("requisicaoCancelamento");

    cy.visit("/competicao/42");
    cy.contains("button", "Solicitar inscrição").click();
    cy.wait("@requisicaoInscricao");
    cy.contains("Inscrição enviada e aguardando aprovação.").should("be.visible");
    cy.contains("button", "Cancelar solicitação").click();
    cy.wait("@requisicaoCancelamento");
    cy.contains("Solicitação cancelada com sucesso.").should("be.visible");
    cy.contains("button", "Solicitar inscrição").should("be.visible");
  });

  it("permite ao organizador aprovar uma inscrição pendente", () => {
    const competencia = competenciaBase();
    const inscricaoPendente = {
      id: 51,
      id_participante: 105,
      tipo_participante: "usuario",
      aprovado: false,
      participante: { apelido: "Jogador Pendente" },
    };
    let participantes = [inscricaoPendente];
    prepararDetalhesDaCompeticao({ competencia });
    cy.intercept("GET", "**/competicoes/42/participantes*", (requisicao) => {
      requisicao.reply({ statusCode: 200, body: participantes });
    });
    cy.intercept("PUT", "**/participantes/51", (requisicao) => {
      participantes = [{ ...inscricaoPendente, aprovado: true }];
      requisicao.reply({ statusCode: 200, body: participantes[0] });
    }).as("requisicaoAprovacao");

    cy.visit("/competicao/42");
    cy.contains("Jogador Pendente").should("be.visible");
    cy.contains("button", "Aprovar").click();
    cy.wait("@requisicaoAprovacao");

    cy.contains("Participante aprovado com sucesso!").should("be.visible");
    cy.contains("Aprovado").should("be.visible");
  });

  it("inscreve uma equipe na competição e atualiza o status da inscrição", () => {
    const competencia = competenciaBase({ dono: 2, inscricao: true });
    let inscricao = [];
    prepararDetalhesDaCompeticao({ competencia });
    cy.intercept("GET", "**/minhas-equipes", {
      statusCode: 200,
      body: [{ id: 77, nome: "Equipe dos Testes" }],
    });
    cy.intercept("GET", "**/competicoes/42/participantes*", (requisicao) => {
      requisicao.reply({ statusCode: 200, body: inscricao });
    });
    cy.intercept("POST", "**/competicoes/42/participantes", (requisicao) => {
      inscricao = [{
        id: 23,
        id_competicao: 42,
        id_participante: 77,
        tipo_participante: "equipe",
        aprovado: true,
      }];
      requisicao.reply({ statusCode: 201, body: inscricao[0] });
    }).as("requisicaoInscricaoEquipe");

    cy.visit("/competicao/42");
    cy.get("select").select("77");
    cy.contains("button", "Inscrever equipe").click();
    cy.wait("@requisicaoInscricaoEquipe")
      .its("request.body")
      .should("deep.equal", {
        id_competicao: "42",
        id_participante: 77,
        tipo_participante: "equipe",
      });

    cy.contains("Equipe inscrita com sucesso!").should("be.visible");
    cy.contains("button", "Retirar equipe da competição").should("be.visible");
  });

  it("atualiza os dados da competição do organizador", () => {
    prepararDetalhesDaCompeticao();
    cy.intercept("POST", "**/competicoes/42", {
      statusCode: 200,
      body: competenciaBase({ nome: "Campeonato Atualizado" }),
    }).as("requisicaoAtualizacao");

    cy.visit("/competicao/42");
    cy.contains("h2", "Alterar Competição").should("be.visible");
    cy.contains("label", "Nome:")
      .next("input")
      .clear()
      .type("Campeonato Atualizado");
    cy.contains("button", "Salvar mudanças").click();

    cy.wait("@requisicaoAtualizacao")
      .its("request.headers.content-type")
      .should("include", "multipart/form-data");
  });

  it("gera a chave, avança vencedores e registra o pódio do mata-mata", () => {
    const competencia = competenciaBase({
      modo: "estruturado",
      formato: "mata_mata_4",
      quantidade_participantes: 4,
    });
    const estado = {
      chaveGerada: false,
      semifinalUm: null,
      semifinalDois: null,
      final: null,
      terceiroLugar: null,
    };
    const porId = Object.fromEntries(jogadores.map((jogador) => [
      jogador.id_participante,
      { tipo: "usuario", id: jogador.id_participante, nome: jogador.participante.apelido },
    ]));
    const dadosDaChave = () => {
      if (!estado.chaveGerada) {
        return resultadosVazios("estruturado", "mata_mata_4");
      }

      const vencedorSemiUm = estado.semifinalUm === "a" ? porId[101] : estado.semifinalUm === "b" ? porId[102] : null;
      const perdedorSemiUm = estado.semifinalUm === "a" ? porId[102] : estado.semifinalUm === "b" ? porId[101] : null;
      const vencedorSemiDois = estado.semifinalDois === "a" ? porId[103] : estado.semifinalDois === "b" ? porId[104] : null;
      const perdedorSemiDois = estado.semifinalDois === "a" ? porId[104] : estado.semifinalDois === "b" ? porId[103] : null;
      const vencedorFinal = estado.final === "a" ? vencedorSemiUm : estado.final === "b" ? vencedorSemiDois : null;
      const perdedorFinal = estado.final === "a" ? vencedorSemiDois : estado.final === "b" ? vencedorSemiUm : null;

      const partida = (id, fase, numero, a, b, resultado) => ({
        id,
        fase,
        numero_partida: numero,
        participante_a: a,
        participante_b: b,
        resultado,
        concluida: Boolean(resultado),
      });

      return {
        configuracao: {
          modo: "estruturado",
          formato: "mata_mata_4",
          quantidade_participantes: 4,
          numero_rodadas: 1,
        },
        partidas: [
          partida(501, "semifinais", 1, porId[101], porId[102], estado.semifinalUm),
          partida(502, "semifinais", 2, porId[103], porId[104], estado.semifinalDois),
          partida(503, "final", 1, vencedorSemiUm, vencedorSemiDois, estado.final),
          partida(504, "terceiro_lugar", 1, perdedorSemiUm, perdedorSemiDois, estado.terceiroLugar),
        ],
        classificacao: [],
        podio: {
          primeiro_lugar: vencedorFinal,
          segundo_lugar: perdedorFinal,
          terceiro_lugar: estado.terceiroLugar === "a" ? perdedorSemiUm : estado.terceiroLugar === "b" ? perdedorSemiDois : null,
        },
      };
    };

    prepararDetalhesDaCompeticao({ competencia, participantes: jogadores });
    cy.intercept("GET", "**/competicoes/42/resultados", (requisicao) => {
      requisicao.reply({ statusCode: 200, body: dadosDaChave() });
    });
    cy.intercept("POST", "**/competicoes/42/chave", (requisicao) => {
      estado.chaveGerada = true;
      requisicao.reply({ statusCode: 200, body: {} });
    }).as("requisicaoGeracaoChave");
    cy.intercept("PUT", "**/competicoes/42/partidas/*/resultado", (requisicao) => {
      const id = requisicao.url.match(/partidas\/(\d+)\/resultado/)[1];
      if (id === "501") estado.semifinalUm = requisicao.body.resultado;
      if (id === "502") estado.semifinalDois = requisicao.body.resultado;
      if (id === "503") estado.final = requisicao.body.resultado;
      if (id === "504") estado.terceiroLugar = requisicao.body.resultado;
      requisicao.reply({ statusCode: 200, body: {} });
    }).as("requisicaoResultado");

    cy.visit("/competicao/42");
    cy.contains("h2", "Chave e resultados").should("be.visible");
    cy.contains("button", "Gerar chave").click();
    cy.wait("@requisicaoGeracaoChave");
    cy.contains("article", "Semifinais · Partida 1").should("be.visible");
    cy.contains("article", "Final · Partida 1").should("be.visible");

    cy.contains("article", "Semifinais · Partida 1").within(() => {
      cy.get("select").select("a");
      cy.contains("button", "Salvar").click();
    });
    cy.wait("@requisicaoResultado");
    cy.contains("article", "Final · Partida 1").should("contain", "Jogador Um");

    cy.contains("article", "Semifinais · Partida 2").within(() => {
      cy.get("select").select("b");
      cy.contains("button", "Salvar").click();
    });
    cy.wait("@requisicaoResultado");
    cy.contains("article", "Final · Partida 1").should("contain", "Jogador Quatro");

    cy.contains("article", "Final · Partida 1").within(() => {
      cy.get("select").select("a");
      cy.contains("button", "Salvar").click();
    });
    cy.wait("@requisicaoResultado");

    cy.contains("article", "Disputa de terceiro lugar · Partida 1").within(() => {
      cy.get("select").select("a");
      cy.contains("button", "Salvar").click();
    });
    cy.wait("@requisicaoResultado");

    cy.contains("Campeão: Jogador Um").should("be.visible");
    cy.contains("Vice: Jogador Quatro").should("be.visible");
    cy.contains("3º lugar: Jogador Dois").should("be.visible");
  });

  it("cria um confronto por pontos e atualiza a classificação após um empate", () => {
    const competencia = competenciaBase({
      modo: "estruturado",
      formato: "pontos",
      quantidade_participantes: 2,
      numero_rodadas: 2,
    });
    let confrontoCriado = false;
    let resultado = null;
    const partida = {
      id: 601,
      fase: "rodada",
      rodada: 1,
      numero_partida: 1,
      participante_a: { tipo: "usuario", id: 101, nome: "Jogador Um" },
      participante_b: { tipo: "usuario", id: 102, nome: "Jogador Dois" },
    };
    const dadosDaClassificacao = () => {
      const empatou = resultado === "empate";
      const linha = (id, nome, posicao) => ({
        posicao,
        participante: { tipo: "usuario", id, nome },
        partidas: confrontoCriado ? 1 : 0,
        vitorias: 0,
        empates: empatou ? 1 : 0,
        derrotas: 0,
        pontos: empatou ? 1 : 0,
      });
      return {
        ...resultadosVazios("estruturado", "pontos"),
        configuracao: {
          modo: "estruturado",
          formato: "pontos",
          quantidade_participantes: 2,
          numero_rodadas: 2,
        },
        partidas: confrontoCriado
          ? [{ ...partida, resultado, concluida: Boolean(resultado) }]
          : [],
        classificacao: [linha(101, "Jogador Um", 1), linha(102, "Jogador Dois", 2)],
      };
    };

    prepararDetalhesDaCompeticao({ competencia, participantes: jogadores.slice(0, 2) });
    cy.intercept("GET", "**/competicoes/42/resultados", (requisicao) => {
      requisicao.reply({ statusCode: 200, body: dadosDaClassificacao() });
    });
    cy.intercept("POST", "**/competicoes/42/partidas", (requisicao) => {
      confrontoCriado = true;
      requisicao.reply({ statusCode: 201, body: {} });
    }).as("requisicaoConfronto");
    cy.intercept("PUT", "**/competicoes/42/partidas/601/resultado", (requisicao) => {
      resultado = requisicao.body.resultado;
      requisicao.reply({ statusCode: 200, body: {} });
    }).as("requisicaoResultadoPontos");

    cy.visit("/competicao/42");
    cy.contains("label", "Participante A").find("select").select("101");
    cy.contains("label", "Participante B").find("select").select("102");
    cy.contains("button", "Adicionar confronto").click();
    cy.wait("@requisicaoConfronto")
      .its("request.body")
      .should("deep.equal", {
        rodada: 1,
        participante_a_id: 101,
        participante_b_id: 102,
      });
    cy.contains("article", "Rodada 1 · Partida 1").should("be.visible");

    cy.get('select[aria-label="Resultado da partida 1"]').select("empate");
    cy.contains("article", "Rodada 1 · Partida 1")
      .contains("button", "Salvar")
      .click();
    cy.wait("@requisicaoResultadoPontos");

    cy.contains("article", "Rodada 1 · Partida 1")
      .should("contain", "Resultado: Empate");
    cy.contains("td", "Jogador Um")
      .parent("tr")
      .children()
      .eq(6)
      .should("have.text", "1");
    cy.contains("td", "Jogador Dois")
      .parent("tr")
      .children()
      .eq(6)
      .should("have.text", "1");
  });

  it("salva o pódio manual com participantes aprovados", () => {
    const competencia = competenciaBase();
    const participantes = jogadores.slice(0, 3);
    let podio = resultadosVazios().podio;
    prepararDetalhesDaCompeticao({ competencia, participantes });
    cy.intercept("GET", "**/competicoes/42/resultados", (requisicao) => {
      const nomes = { 101: "Jogador Um", 102: "Jogador Dois", 103: "Jogador Três" };
      requisicao.reply({
        statusCode: 200,
        body: {
          ...resultadosVazios(),
          podio: Object.fromEntries(
            ["primeiro", "segundo", "terceiro"].map((posicao) => {
              const id = podio[`${posicao}_lugar_id`];
              return [`${posicao}_lugar`, id ? { id, nome: nomes[id] } : null];
            }),
          ),
        },
      });
    });
    cy.intercept("PUT", "**/competicoes/42/podio", (requisicao) => {
      podio = requisicao.body;
      requisicao.reply({ statusCode: 200, body: {} });
    }).as("requisicaoPodio");

    cy.visit("/competicao/42");
    cy.contains("h2", "Pódio da competição").should("be.visible");
    cy.contains("label", "1º lugar").find("select").select("101");
    cy.contains("label", "2º lugar").find("select").select("102");
    cy.contains("label", "3º lugar").find("select").select("103");
    cy.contains("label", "1º lugar")
      .find("select")
      .should("have.value", "101");
    cy.contains("button", "Salvar pódio").click();

    cy.wait("@requisicaoPodio").its("request.body").should("deep.equal", {
      primeiro_lugar_id: "101",
      segundo_lugar_id: "102",
      terceiro_lugar_id: "103",
    });
    cy.contains("Resultado atualizado.").should("be.visible");
    cy.contains("Atual: Jogador Um").should("be.visible");
    cy.contains("Atual: Jogador Dois").should("be.visible");
    cy.contains("Atual: Jogador Três").should("be.visible");
  });

  it("exibe a rejeição da API quando o mesmo participante ocupa duas posições", () => {
    prepararDetalhesDaCompeticao({ participantes: jogadores.slice(0, 3) });
    cy.intercept("PUT", "**/competicoes/42/podio", {
      statusCode: 422,
      body: { message: "Cada participante pode ocupar apenas uma posição." },
    }).as("requisicaoPodio");

    cy.visit("/competicao/42");
    cy.contains("label", "1º lugar").find("select").select("101");
    cy.contains("label", "2º lugar").find("select").select("101");
    cy.contains("button", "Salvar pódio").click();

    cy.wait("@requisicaoPodio");
    cy.get('[role="alert"]')
      .should("contain", "Cada participante pode ocupar apenas uma posição.");
  });
});
