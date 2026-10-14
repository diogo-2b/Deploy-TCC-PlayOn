import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import LightPillar from "../components/LightPillar/LightPillar.jsx";
import Card from "../components/Card/Cards.jsx";
import axiosClient from "../utils/axios-client";

const VisualizarPerfil = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [aba, setAba] = useState("equipes");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    const carregarPerfil = async () => {
      setCarregando(true);
      setErro("");

      try {
        const resposta = await axiosClient.get(`/usuarios/${id}/perfil`);
        if (ativo) {
          setPerfil(resposta.data);
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        if (ativo) {
          setErro(
            error?.response?.data?.message ||
              "Não foi possível carregar este perfil.",
          );
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    };

    if (id) carregarPerfil();
    else {
      setErro("Usuário não encontrado.");
      setCarregando(false);
    }

    return () => {
      ativo = false;
    };
  }, [id]);

  const usuario = perfil?.usuario?.data || perfil?.usuario;
  const equipes = perfil?.equipes?.data || perfil?.equipes || [];
  const competicoes = perfil?.competicoes?.data || perfil?.competicoes || [];
  const itens = aba === "equipes" ? equipes : competicoes;
  const avatarUrl =
    usuario?.imagem_url ||
    usuario?.foto_url ||
    usuario?.avatar_url ||
    "/imagens/foto.png";

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        Carregando perfil...
      </main>
    );
  }

  if (erro || !usuario) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black text-white">
        <p className="text-red-300">{erro || "Usuário não encontrado."}</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-md border-2 border-[#c09318] px-3 py-2 font-bold text-[#c09318]"
        >
          ← Voltar
        </button>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-black font-sans text-white">
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

      <section className="relative z-10 mx-auto w-full max-w-4xl px-4 py-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 rounded-md border-2 border-[#c09318] px-3 py-2 font-bold text-[#c09318]"
        >
          ← Voltar
        </button>

        <div className="rounded-2xl border border-white/10 bg-black/40 p-6 shadow-2xl backdrop-blur-md">
          <div className="mb-8 flex flex-col items-center">
            <img
              src={avatarUrl}
              alt={`Foto de ${usuario.apelido || usuario.nome || "usuário"}`}
              className="h-40 w-40 rounded-full border border-[#c09318] object-cover shadow-lg"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = "/imagens/foto.png";
              }}
            />
            <h1 className="mt-4 text-2xl font-bold">
              {usuario.nome || usuario.apelido || "Perfil do usuário"}
            </h1>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm text-gray-400">Nome</label>
              <div className="mt-1 rounded-md border border-white/10 bg-white/5 p-3 text-gray-200">
                {usuario.nome || "Não informado"}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400">Apelido</label>
              <div className="mt-1 rounded-md border border-white/10 bg-white/5 p-3 text-gray-200">
                {usuario.apelido || "Não informado"}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm text-gray-400">Email</label>
              <div className="mt-1 rounded-md border border-white/10 bg-white/5 p-3 text-gray-400">
                {usuario.email || "Não informado"}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
              <button
                type="button"
                onClick={() => setAba("equipes")}
                className={`rounded-md px-4 py-2 font-semibold ${
                  aba === "equipes"
                    ? "bg-[#81700e] text-white"
                    : "bg-white/10 text-gray-300"
                }`}
              >
                Equipes ({equipes.length})
              </button>
              <button
                type="button"
                onClick={() => setAba("competicoes")}
                className={`rounded-md px-4 py-2 font-semibold ${
                  aba === "competicoes"
                    ? "bg-[#81700e] text-white"
                    : "bg-white/10 text-gray-300"
                }`}
              >
                Competições ({competicoes.length})
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {itens.length > 0 ? (
                itens.map((item) => <Card key={item.codigo || item.id} info={item} />)
              ) : (
                <p className="text-gray-300">
                  {aba === "equipes"
                    ? "Este usuário ainda não participa de nenhuma equipe."
                    : "Este usuário ainda não participa de nenhuma competição."}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default VisualizarPerfil;
