import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import LightPillar from "../components/LightPillar/LightPillar.jsx";
import { Header } from "../components/Header/Header.jsx";
import { NavBar } from "../components/NavBar/NavBar.jsx";
import axiosClient from "../utils/axios-client";
import { useAuthContext } from "../context/AuthProvider";

const tipoLabel = {
  Equipe: "Equipe",
  Competicao: "Competição",
  Usuario: "Usuário",
};

const targetPath = (tipo, id) => {
  if (tipo === "Equipe") return `/equipe/${id}`;
  if (tipo === "Competicao") return `/competicao/${id}`;
  return `/perfil/${id}`;
};

const imagemUrl = (url) => {
  if (!url) return "/imagens/foto.png";
  if (/^https?:\/\//i.test(url)) {
    const baseUrl = (
      import.meta.env.VITE_API_URL ||
      import.meta.env.VITE_BASE_URL ||
      ""
    ).replace(/\/api\/v\d+\/?$/i, "");
    return url.replace(
      /^https?:\/\/localhost(?::\d+)?/i,
      baseUrl || "http://localhost:8000",
    );
  }
  return url;
};

const GerenciarDenuncias = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [denuncias, setDenuncias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [processandoId, setProcessandoId] = useState(null);

  useEffect(() => {
    if (!user?.is_admin) return;

    let ativo = true;
    const carregarDenuncias = async () => {
      setCarregando(true);
      setErro("");
      try {
        const resposta = await axiosClient.get("/denuncias");
        const dados = Array.isArray(resposta.data)
          ? resposta.data
          : resposta.data?.data || [];
        if (ativo) setDenuncias(dados);
      } catch (error) {
        if (ativo) {
          setErro(
            error?.response?.data?.message ||
              "Não foi possível carregar as denúncias.",
          );
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    };

    carregarDenuncias();
    return () => {
      ativo = false;
    };
  }, [user]);

  if (!user?.is_admin) {
    return <Navigate to="/home" replace />;
  }

  const resolver = async (id) => {
    setProcessandoId(id);
    setErro("");
    try {
      await axiosClient.patch(`/denuncias/${id}/resolver`);
      setDenuncias((atuais) =>
        atuais.map((denuncia) =>
          denuncia.id === id ? { ...denuncia, resolvida: true } : denuncia,
        ),
      );
    } catch (error) {
      setErro(
        error?.response?.data?.message ||
          "Não foi possível marcar a denúncia como resolvida.",
      );
    } finally {
      setProcessandoId(null);
    }
  };

  return (
    <div className="home-body relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0">
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
        <section className="mx-auto w-full max-w-5xl px-4 pb-12">
          <button
            type="button"
            onClick={() => navigate("/home")}
            className="mb-5 rounded-md border-2 border-[#c09318] px-3 py-2 font-bold text-[#c09318]"
          >
            ← Voltar
          </button>
          <h1 className="mb-6 text-2xl font-bold text-white">
            Gerenciamento de denúncias
          </h1>

          {erro && (
            <p className="mb-5 rounded-md border border-red-400/40 bg-red-400/10 p-3 text-red-200">
              {erro}
            </p>
          )}

          {carregando ? (
            <p className="text-gray-300">Carregando denúncias...</p>
          ) : denuncias.length === 0 ? (
            <p className="rounded-xl border border-white/10 bg-black/40 p-6 text-gray-300">
              Nenhuma denúncia cadastrada.
            </p>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {denuncias.map((denuncia) => {
                const alvo = denuncia.alvo;
                const denunciante = denuncia.denunciante;
                return (
                  <article
                    key={denuncia.id}
                    className="rounded-xl border border-white/10 bg-black/50 p-5 text-white shadow-xl backdrop-blur-md"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          denuncia.resolvida
                            ? "bg-green-500/20 text-green-300"
                            : "bg-yellow-500/20 text-yellow-200"
                        }`}
                      >
                        {denuncia.resolvida ? "Resolvida" : "Pendente"}
                      </span>
                      <span className="text-xs text-gray-400">
                        {tipoLabel[denuncia.tipo] || denuncia.tipo}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={imagemUrl(denunciante?.imagem_url)}
                          alt=""
                          className="h-12 w-12 rounded-full border border-[#c09318] object-cover"
                        />
                        <div>
                          <p className="text-xs text-gray-400">Denunciante</p>
                          <a
                            href={`/perfil/${denunciante?.id}`}
                            className="font-semibold hover:text-yellow-300"
                          >
                            {denunciante?.apelido || "Usuário"}
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <img
                          src={imagemUrl(alvo?.imagem_url)}
                          alt=""
                          className="h-12 w-12 rounded-full border border-[#c09318] object-cover"
                        />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-400">Alvo</p>
                          {alvo ? (
                            <a
                              href={targetPath(
                                denuncia.tipo,
                                denuncia.id_denunciado,
                              )}
                              className="font-semibold hover:text-yellow-300"
                            >
                              {alvo.nome}
                            </a>
                          ) : (
                            <span className="text-gray-400">
                              Registro não encontrado
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 rounded-md border border-white/10 bg-white/5 p-4">
                      <p className="mb-1 text-xs text-gray-400">Mensagem</p>
                      <p className="whitespace-pre-wrap break-words text-sm text-gray-100">
                        {denuncia.mensagem}
                      </p>
                    </div>

                    <div className="mt-4 flex justify-end">
                      {denuncia.resolvida ? (
                        <span className="text-sm font-semibold text-green-300">
                          ✓ Concluída
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => resolver(denuncia.id)}
                          disabled={processandoId === denuncia.id}
                          className="rounded bg-[#81700e] px-4 py-2 text-sm font-semibold disabled:opacity-50"
                        >
                          {processandoId === denuncia.id
                            ? "Salvando..."
                            : "Marcar como resolvida"}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default GerenciarDenuncias;
