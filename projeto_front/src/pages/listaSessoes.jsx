import Skeleton from "react-loading-skeleton";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import LightPillar from "../components/LightPillar/LightPillar.jsx";
import { Header } from "../components/Header/Header.jsx";
import { Footer } from "../components/Footer/footer.jsx";
import { NavBar } from "../components/NavBar/NavBar.jsx";
import ListaSessoesComponent from "../components/ListaSessoes/ListaSessoes.jsx";
import { useSessoes } from "../context/SessoesProvider";
import { useAuthContext } from "../context/AuthProvider";
import "./Home.css";

const ListaSessoes = () => {
  const { data: sessoes, loading } = useSessoes();
  const { user } = useAuthContext();
  const [searchParams] = useSearchParams();
  const somenteMinhas = searchParams.get("mine") === "1";
  const usuarioId = Number(user?.id || user?.codigo || user?.codigoUsuario || 0);
  const [filtroAberto, setFiltroAberto] = useState(false);
  const [jogoSelecionado, setJogoSelecionado] = useState("");
  const [jogoFiltrado, setJogoFiltrado] = useState("");

  const normalizarTexto = (texto) =>
    String(texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase()
      .trim();

  const sessoesBase = useMemo(
    () =>
      somenteMinhas
        ? (sessoes || []).filter(
            (sessao) =>
              Number(sessao.criador_id) === usuarioId ||
              (Array.isArray(sessao.jogadores) &&
                sessao.jogadores.some(
                  (jogador) => Number(jogador.id) === usuarioId,
                )),
          )
        : sessoes || [],
    [sessoes, somenteMinhas, usuarioId],
  );

  const jogosDisponiveis = useMemo(() => {
    const jogos = sessoesBase
      .map((sessao) => sessao.jogo)
      .filter((jogo) => jogo?.nome);

    return Array.from(
      new Map(jogos.map((jogo) => [jogo.id ?? jogo.igdb_id ?? jogo.nome, jogo])).values(),
    ).sort((primeiro, segundo) => primeiro.nome.localeCompare(segundo.nome));
  }, [sessoesBase]);

  const sessoesExibidas = useMemo(
    () =>
      jogoFiltrado
        ? sessoesBase.filter(
            (sessao) =>
              normalizarTexto(sessao.jogo?.nome) === normalizarTexto(jogoFiltrado),
          )
        : sessoesBase,
    [jogoFiltrado, sessoesBase],
  );

  const aplicarFiltro = () => {
    setJogoFiltrado(jogoSelecionado.trim());
    setFiltroAberto(false);
  };

  const limparFiltro = () => {
    setJogoSelecionado("");
    setJogoFiltrado("");
    setFiltroAberto(false);
  };

  const mensagemVazia = jogoFiltrado
    ? "Nenhuma sessão encontrada para este jogo."
    : somenteMinhas
      ? "Você ainda não participa de nenhuma sessão."
      : "Nenhuma sessão encontrada.";

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
                  href="/sessoes/cadastrar"
                >
                  Criar
                </a>
              </li>
              <li>
                <a
                  className="text-white hover:text-yellow-300"
                  href="/sessoes?mine=1"
                >
                  Minhas Sessões
                </a>
              </li>
            </ul>
            <div className="competicao-filtro">
              <button
                type="button"
                className="competicao-filtro-botao"
                aria-expanded={filtroAberto}
                aria-controls="sessao-filtro-painel"
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
                {jogoFiltrado && (
                  <span className="competicao-filtro-resumo">
                    : {jogoFiltrado}
                  </span>
                )}
              </button>
              {filtroAberto && (
                <div
                  id="sessao-filtro-painel"
                  className="competicao-filtro-painel"
                  role="dialog"
                  aria-label="Filtrar sessões"
                >
                  <label htmlFor="filtro-jogo-sessao">Jogo</label>
                  <input
                    id="filtro-jogo-sessao"
                    type="search"
                    list="jogos-sessoes-disponiveis"
                    placeholder="Digite o nome do jogo"
                    autoComplete="off"
                    value={jogoSelecionado}
                    onChange={(event) => setJogoSelecionado(event.target.value)}
                  />
                  <datalist id="jogos-sessoes-disponiveis">
                    {jogosDisponiveis.map((jogo) => (
                      <option
                        key={jogo.id ?? jogo.igdb_id ?? jogo.nome}
                        value={jogo.nome}
                      />
                    ))}
                  </datalist>
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

        <section className="secao-sessoes">
          <h2 className="titulo-secao">
            {somenteMinhas ? "Minhas Sessões" : "Sessões"}
          </h2>

          {loading ? (
            <div className="grid gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                >
                  <Skeleton height={18} width="40%" />
                  <div className="mt-3 space-y-2">
                    <Skeleton height={14} width="90%" />
                    <Skeleton height={14} width="70%" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ListaSessoesComponent
              sessoes={sessoesExibidas}
              mensagemVazia={mensagemVazia}
            />
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ListaSessoes;
