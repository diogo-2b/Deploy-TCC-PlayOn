import Skeleton from "react-loading-skeleton";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import LightPillar from "../components/LightPillar/LightPillar.jsx";
import { Header } from "../components/Header/Header.jsx";
import { Footer } from "../components/Footer/footer.jsx";
import { NavBar } from "../components/NavBar/NavBar.jsx";
import Card from "../components/Card/Cards.jsx";
import { useCompeticoes } from "../context/CompeticoesProvider";
import { useEquipes } from "../context/EquipesProvider";
import { useAuthContext } from "../context/AuthProvider";
import axiosClient from "../utils/axios-client";
import "./Home.css";

const ListaCompeticao = () => {
  const { data: competicoes, loading } = useCompeticoes();
  const { data: equipes } = useEquipes();
  const { user } = useAuthContext();
  const [searchParams] = useSearchParams();
  const somenteMinhas = searchParams.get("mine") === "1";
  const usuarioId = Number(user?.id || user?.codigo || user?.codigoUsuario || 0);

  const [participacoes, setParticipacoes] = useState({});
  const [filtroAberto, setFiltroAberto] = useState(false);
  const [jogoSelecionado, setJogoSelecionado] = useState("");
  const [jogoFiltrado, setJogoFiltrado] = useState("");
  const [tipoSelecionado, setTipoSelecionado] = useState("");
  const [tipoFiltrado, setTipoFiltrado] = useState("");

  const normalizarTexto = (texto) =>
    String(texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase()
      .trim();

  useEffect(() => {
    if (!somenteMinhas || !usuarioId || !competicoes) return;

    let ativo = true;
    Promise.all(
      competicoes.map(async (competicao) => {
        try {
          const response = await axiosClient.get(
            `/competicoes/${competicao.codigo}/participantes?include_pending=1`,
          );
          const participantes = Array.isArray(response.data)
            ? response.data
            : response.data?.data || [];
          const equipesDoUsuario = (equipes || [])
            .filter(
              (equipe) =>
                Number(
                  equipe.administrador ?? equipe.dono ?? equipe.usuario_id,
                ) === usuarioId,
            )
            .map((equipe) => Number(equipe.codigo ?? equipe.id));
          const participa = participantes.some(
            (participante) =>
              (participante.tipo_participante === "usuario" &&
                Number(participante.id_participante) === usuarioId) ||
              (participante.tipo_participante === "equipe" &&
                equipesDoUsuario.includes(
                  Number(participante.id_participante),
                )),
          );
          return [competicao.codigo, participa];
        } catch (error) {
          console.error(
            `Erro ao verificar participação na competição ${competicao.codigo}:`,
            error,
          );
          return [competicao.codigo, false];
        }
      }),
    ).then((resultado) => {
      if (ativo) setParticipacoes(Object.fromEntries(resultado));
    });

    return () => {
      ativo = false;
    };
  }, [competicoes, equipes, somenteMinhas, usuarioId]);

  const jogosDisponiveis = useMemo(() => {
    const jogos = (competicoes || [])
      .map((competicao) => competicao.jogo)
      .filter((jogo) => jogo?.nome);

    return Array.from(
      new Map(jogos.map((jogo) => [jogo.id ?? jogo.igdb_id ?? jogo.nome, jogo])).values(),
    ).sort((primeiro, segundo) => primeiro.nome.localeCompare(segundo.nome));
  }, [competicoes]);

  const competicoesExibidas = useMemo(() => {
    const competicoesBase = somenteMinhas
      ? (competicoes || []).filter(
          (competicao) =>
            Number(competicao.dono ?? competicao.usuario_id) === usuarioId ||
            participacoes[competicao.codigo],
        )
      : competicoes || [];

    return competicoesBase.filter((competicao) => {
      const correspondeAoJogo =
        !jogoFiltrado ||
        normalizarTexto(competicao.jogo?.nome) ===
          normalizarTexto(jogoFiltrado);
      const correspondeAoTipo =
        !tipoFiltrado || competicao.tipo === tipoFiltrado;

      return correspondeAoJogo && correspondeAoTipo;
    });
  }, [
    competicoes,
    jogoFiltrado,
    participacoes,
    somenteMinhas,
    tipoFiltrado,
    usuarioId,
  ]);

  const aplicarFiltro = () => {
    setJogoFiltrado(jogoSelecionado.trim());
    setTipoFiltrado(tipoSelecionado);
    setFiltroAberto(false);
  };

  const limparFiltro = () => {
    setJogoSelecionado("");
    setJogoFiltrado("");
    setTipoSelecionado("");
    setTipoFiltrado("");
    setFiltroAberto(false);
  };

  const filtrosAtivos = [jogoFiltrado, tipoFiltrado].filter(Boolean);
  const nomeFiltroAtivo = filtrosAtivos.join(" - ");

  const mensagemVazia = jogoFiltrado
    ? "Nenhuma competição encontrada para este jogo."
    : somenteMinhas
      ? "Você ainda não participa de nenhuma competição."
      : "Nenhuma competição encontrada.";

  return (
    <div className="home-body relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <LightPillar
          topColor="goldenrod"
          bottomColor="goldenrod"
          intensity={1}
          rotationSpeed={0.3}
          glowAmount={0.002}
          pillarWidth={3}
          pillarHeight={0.4}
          noiseIntensity={0.5}
          pillarRotation={25}
          interactive={false}
          mixBlendMode="screen"
          quality="high"
        />
      </div>

      <Header />

      <main className="main-container relative z-10">
        <NavBar />
        <nav className="nav-lista my-4 relative z-0">
          <div className="nav-container w-full">
            <ul className="flex justify-center space-x-6 w-full">
              <li>
                <a
                  className="text-white hover:text-yellow-300"
                  href="/competicoes/cadastrar"
                >
                  Criar
                </a>
              </li>
              <li>
                <a
                  className="text-white hover:text-yellow-300"
                  href="/competicoes?mine=1"
                >
                  Minhas Competições
                </a>
              </li>
            </ul>
            <div className="competicao-filtro">
              <button
                type="button"
                className="competicao-filtro-botao"
                aria-expanded={filtroAberto}
                aria-controls="competicao-filtro-painel"
                onClick={() => setFiltroAberto((aberto) => !aberto)}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="competicao-filtro-icone"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 6h16M7 12h10m-7 6h4" />
                </svg>
                Filtro
                {nomeFiltroAtivo && (
                  <span className="competicao-filtro-resumo">
                    : {nomeFiltroAtivo}
                  </span>
                )}
              </button>
              {filtroAberto && (
                <div
                  id="competicao-filtro-painel"
                  className="competicao-filtro-painel"
                  role="dialog"
                  aria-label="Filtrar competições"
                >
                  <label htmlFor="filtro-jogo">Jogo</label>
                  <input
                    id="filtro-jogo"
                    type="search"
                    list="jogos-disponiveis"
                    placeholder="Digite o nome do jogo"
                    autoComplete="off"
                    value={jogoSelecionado}
                    onChange={(event) => setJogoSelecionado(event.target.value)}
                  />
                  <datalist id="jogos-disponiveis">
                    {jogosDisponiveis.map((jogo) => (
                      <option key={jogo.id ?? jogo.igdb_id ?? jogo.nome} value={jogo.nome} />
                    ))}
                  </datalist>
                  <span className="competicao-filtro-legenda">Visibilidade</span>
                  <label className="competicao-filtro-opcao">
                    <input
                      type="checkbox"
                      checked={tipoSelecionado === "publico"}
                      onChange={() =>
                        setTipoSelecionado((tipo) =>
                          tipo === "publico" ? "" : "publico",
                        )
                      }
                    />
                    Público
                  </label>
                  <label className="competicao-filtro-opcao">
                    <input
                      type="checkbox"
                      checked={tipoSelecionado === "privado"}
                      onChange={() =>
                        setTipoSelecionado((tipo) =>
                          tipo === "privado" ? "" : "privado",
                        )
                      }
                    />
                    Privado
                  </label>
                  <div className="competicao-filtro-acoes">
                    <button type="button" onClick={limparFiltro}>
                      Limpar
                    </button>
                    <button type="button" onClick={aplicarFiltro}>
                      Aplicar filtros
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>

        <section className="secao-carrossel">
          <h2 className="titulo-secao">
            {somenteMinhas ? "Minhas Competições" : "Competições"}
          </h2>

          <div className="carrossel lista-grid">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                >
                  <Skeleton height={220} className="rounded-xl" />
                  <div className="mt-4 space-y-2">
                    <Skeleton height={18} width="70%" />
                    <Skeleton height={14} width="90%" />
                    <Skeleton height={14} width="40%" />
                  </div>
                </div>
              ))
            ) : competicoesExibidas && competicoesExibidas.length > 0 ? (
              competicoesExibidas.map((comp) => (
                <div key={comp.codigo} style={{ cursor: "pointer" }}>
                  <Card info={comp} />
                </div>
              ))
            ) : (
              <p className="text-gray-300">
                {mensagemVazia}
              </p>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ListaCompeticao;
