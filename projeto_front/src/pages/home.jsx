import "./Home.css";
import LightPillar from "../components/LightPillar/LightPillar.jsx";
import { Header } from "../components/Header/Header.jsx";
import { Footer } from "../components/Footer/footer.jsx";
import { NavBar } from "../components/NavBar/NavBar.jsx";
import Carrossel from "../components/Carrossel/carrossel.jsx";
import ListaSessoes from "../components/ListaSessoes/ListaSessoes.jsx";
import { useCompeticoes } from "../context/CompeticoesProvider";
import { useEquipes } from "../context/EquipesProvider";
import { useSessoes } from "../context/SessoesProvider";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import axiosClient from "../utils/axios-client";

const Home = ({ publico = false }) => {
  const { data: competicoes } = useCompeticoes();
  const { data: equipes } = useEquipes();
  const { data: sessoes } = useSessoes();
  const [ranking, setRanking] = useState({ usuarios: [], equipes: [] });
  const [rankingCarregando, setRankingCarregando] = useState(true);
  const [rankingErro, setRankingErro] = useState("");

  useEffect(() => {
    let ativo = true;

    const carregarRanking = async () => {
      try {
        const resposta = await axiosClient.get("/ranking");
        if (
          !Array.isArray(resposta.data?.usuarios) ||
          !Array.isArray(resposta.data?.equipes)
        ) {
          throw new Error("Formato de resposta do ranking inválido.");
        }

        if (ativo) {
          setRanking({
            usuarios: resposta.data.usuarios,
            equipes: resposta.data.equipes,
          });
        }
      } catch (error) {
        console.error("Erro ao carregar o ranking:", error);
        if (ativo) {
          setRankingErro("Não foi possível carregar o ranking agora.");
        }
      } finally {
        if (ativo) setRankingCarregando(false);
      }
    };

    carregarRanking();
    return () => {
      ativo = false;
    };
  }, []);

  const rankings = [
    { chave: "usuarios", titulo: "Usuários", itens: ranking.usuarios },
    { chave: "equipes", titulo: "Equipes", itens: ranking.equipes },
  ];

  return (
    <div className="home-body relative">
      {/* Background */}
      <div className="background-layer">
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
      <Header publico={publico} />
      <main className="main-container relative z-10">
        <NavBar />
        <section
          aria-labelledby="titulo-ranking"
          className="mx-auto my-8 w-[calc(100%-2rem)] max-w-5xl rounded-2xl border border-[#c09318]/40 bg-black/40 p-5 text-white shadow-2xl backdrop-blur-md sm:p-7"
        >
          <div className="mb-5 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c09318]">
              Destaques da comunidade
            </p>
            <h2 id="titulo-ranking" className="mt-1 text-2xl font-bold">
              Ranking PlayOn
            </h2>
          </div>

          {rankingErro ? (
            <p className="text-center text-sm text-red-300">{rankingErro}</p>
          ) : rankingCarregando ? (
            <p className="text-center text-sm text-gray-300">
              Carregando ranking...
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {rankings.map(({ chave, titulo, itens }) => (
                <div key={chave}>
                  <h3 className="mb-3 text-center text-lg font-semibold">
                    {titulo} com mais pontos
                  </h3>
                  {itens.length > 0 ? (
                    <ol className="space-y-2">
                      {itens.map((item, index) => {
                        const nome =
                          chave === "usuarios"
                            ? item.apelido || item.nome || "Usuário"
                            : item.nome || "Equipe";
                        const destino =
                          chave === "usuarios"
                            ? `/perfil/${item.id}`
                            : `/equipe/${item.id}`;
                        const pontos = Number(item.pontos ?? 0);

                        return (
                          <li key={item.id}>
                            <Link
                              to={destino}
                              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 transition hover:border-[#c09318]/60 hover:bg-white/10"
                            >
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#81700e] text-sm font-bold">
                                {index + 1}
                              </span>
                              <img
                                src={item.imagem_url || "/imagens/foto.png"}
                                alt=""
                                className={`h-10 w-10 shrink-0 border border-[#c09318]/60 object-cover ${
                                  chave === "usuarios"
                                    ? "rounded-full"
                                    : "rounded-lg"
                                }`}
                                onError={(event) => {
                                  event.currentTarget.onerror = null;
                                  event.currentTarget.src = "/imagens/foto.png";
                                }}
                              />
                              <span className="min-w-0 flex-1 truncate font-semibold">
                                {nome}
                              </span>
                              <span className="shrink-0 text-sm font-semibold text-[#e2bd4b]">
                                {pontos.toLocaleString("pt-BR")} pts
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ol>
                  ) : (
                    <p className="rounded-xl border border-white/10 bg-white/5 p-4 text-center text-sm text-gray-300">
                      Ainda não há pontos contabilizados.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="secao-carrossel">
          <h2 className="titulo-secao">Competições</h2>
          <Carrossel competicao={competicoes || []} />
        </section>
        <section className="secao-carrossel">
          <h2 className="titulo-secao">Equipes</h2>
          <Carrossel equipe={equipes || []} />
        </section>
        <section className="secao-sessoes">
          <h2 className="titulo-secao">Sessões</h2>
          <ListaSessoes sessoes={sessoes || []} />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
