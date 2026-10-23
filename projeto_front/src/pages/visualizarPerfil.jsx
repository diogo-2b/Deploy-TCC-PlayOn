import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import LightPillar from "../components/LightPillar/LightPillar.jsx";
import Card from "../components/Card/Cards.jsx";
import DenunciaModal from "../components/DenunciaModal/DenunciaModal.jsx";
import axiosClient from "../utils/axios-client";
import { useAuthContext } from "../context/AuthProvider";
import SteamMiniProfile from "../components/SteamMiniProfile/SteamMiniProfile.jsx";
import RecentSteamGames from "../components/RecentSteamGames/RecentSteamGames.jsx";

const VisualizarPerfil = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [perfil, setPerfil] = useState(null);
  const [aba, setAba] = useState("equipes");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState("");
  const [apelido, setApelido] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [imagem, setImagem] = useState(null);
  const [imagemPreview, setImagemPreview] = useState(null);
  const [steamSecaoAberta, setSteamSecaoAberta] = useState(true);
  const podeEditar = Boolean(user?.is_admin);

  useEffect(() => {
    let ativo = true;

    const carregarPerfil = async () => {
      setCarregando(true);
      setErro("");

      try {
        const resposta = await axiosClient.get(`/usuarios/${id}/perfil`);
        if (ativo) {
          setPerfil(resposta.data);
          const dadosUsuario = resposta.data?.usuario?.data || resposta.data?.usuario;
          setNome(dadosUsuario?.nome || "");
          setApelido(dadosUsuario?.apelido || "");
          setEmail(dadosUsuario?.email || "");
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

  useEffect(() => {
    return () => {
      if (imagemPreview) URL.revokeObjectURL(imagemPreview);
    };
  }, [imagemPreview]);

  const handleUpdate = async (event) => {
    event.preventDefault();
    setMensagem("");

    try {
      const formData = new FormData();
      formData.append("nome", nome);
      formData.append("apelido", apelido);
      formData.append("email", email);
      if (senha) formData.append("password", senha);
      if (imagem) formData.append("imagem", imagem);
      formData.append("_method", "PUT");

      const resposta = await axiosClient.post(`/usuarios/${id}`, formData);
      const usuarioAtualizado = resposta.data?.data || resposta.data;

      setPerfil((atual) => ({
        ...atual,
        usuario: usuarioAtualizado,
      }));
      setSenha("");
      setImagem(null);
      setImagemPreview(null);
      setEditando(false);
      setMensagem("Usuário atualizado com sucesso.");
    } catch (error) {
      setMensagem(
        error?.response?.data?.message || "Erro ao atualizar o usuário.",
      );
    }
  };

  const usuario = perfil?.usuario?.data || perfil?.usuario;
  const equipes = perfil?.equipes?.data || perfil?.equipes || [];
  const competicoes = perfil?.competicoes?.data || perfil?.competicoes || [];
  const itens = aba === "equipes" ? equipes : competicoes;
  const avatarUrl =
    usuario?.imagem_url ||
    usuario?.foto_url ||
    usuario?.avatar_url ||
    "/imagens/foto.png";
  const steam = usuario?.steam;
  const estadosSteam = {
    0: "Offline",
    1: "Online",
    2: "Ocupado",
    3: "Ausente",
    4: "Soneca",
    5: "Procurando troca",
    6: "Procurando partida",
  };

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
        <DenunciaModal
          tipo="Usuario"
          idDenunciado={id}
          onSuccess={setMensagem}
        />
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 rounded-md border-2 border-[#c09318] px-3 py-2 font-bold text-[#c09318]"
        >
          ← Voltar
        </button>
        {mensagem && (
          <p className="mb-4 text-sm text-green-300">{mensagem}</p>
        )}

        <div className="rounded-2xl border border-white/10 bg-black/40 p-6 shadow-2xl backdrop-blur-md">
          <div className="mb-8 flex flex-col items-center">
            <img
              src={imagemPreview || avatarUrl}
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

          {podeEditar && (
            <button
              type="button"
              onClick={() => setEditando((atual) => !atual)}
              className="mb-5 rounded-md bg-[#81700e] px-4 py-2 font-semibold"
            >
              {editando ? "Cancelar edição" : "Editar usuário"}
            </button>
          )}

          {editando ? (
            <form onSubmit={handleUpdate} className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-gray-400">
                Nome
                <input
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  className="mt-1 w-full rounded-md border border-white/10 bg-white/5 p-3 text-white outline-none focus:border-[#c09318]"
                />
              </label>
              <label className="text-sm text-gray-400">
                Apelido
                <input
                  value={apelido}
                  onChange={(event) => setApelido(event.target.value)}
                  className="mt-1 w-full rounded-md border border-white/10 bg-white/5 p-3 text-white outline-none focus:border-[#c09318]"
                />
              </label>
              <label className="text-sm text-gray-400 sm:col-span-2">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-1 w-full rounded-md border border-white/10 bg-white/5 p-3 text-white outline-none focus:border-[#c09318]"
                />
              </label>
              <label className="text-sm text-gray-400 sm:col-span-2">
                Nova senha (opcional)
                <input
                  type="password"
                  value={senha}
                  onChange={(event) => setSenha(event.target.value)}
                  className="mt-1 w-full rounded-md border border-white/10 bg-white/5 p-3 text-white outline-none focus:border-[#c09318]"
                />
              </label>
              <label className="text-sm text-gray-400 sm:col-span-2">
                Foto
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const arquivo = event.target.files?.[0] || null;
                    setImagem(arquivo);
                    setImagemPreview(
                      arquivo ? URL.createObjectURL(arquivo) : null,
                    );
                  }}
                  className="mt-1 w-full rounded-md border border-white/10 bg-white/5 p-2 text-white"
                />
              </label>
              <button
                type="submit"
                className="rounded bg-[#81700e] px-4 py-2 font-semibold sm:col-span-2"
              >
                Salvar alterações
              </button>
            </form>
          ) : (
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
          )}

          {steam && (
            <section className="relative mt-6 rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-[#c09318]">Conta Steam</h2>
                <button
                  type="button"
                  aria-label={steamSecaoAberta ? "Minimizar seção Steam" : "Expandir seção Steam"}
                  aria-expanded={steamSecaoAberta}
                  onClick={() => setSteamSecaoAberta((atual) => !atual)}
                  className="rounded px-2 py-1 text-xl leading-none text-[#c09318] transition hover:bg-white/10"
                >
                  {steamSecaoAberta ? "↑" : "↓"}
                </button>
              </div>
              {steamSecaoAberta && (
                <>
              <div className="flex flex-wrap items-center gap-4">
                {steam.avatar && <img src={steam.avatar} alt="" className="h-16 w-16 rounded-full" />}
                <div>
                  <p className="font-semibold">{steam.personaname || "Nome indisponível"}</p>
                  <SteamMiniProfile steam={steam} />
                  {steam.personastate !== null && steam.personastate !== undefined && (
                    <p className="text-sm text-gray-300">Estado: {estadosSteam[Number(steam.personastate)] || "Indisponível"}</p>
                  )}
                </div>
              </div>
                  <RecentSteamGames usuarioId={usuario.id} hasSteam />
                </>
              )}
            </section>
          )}

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
