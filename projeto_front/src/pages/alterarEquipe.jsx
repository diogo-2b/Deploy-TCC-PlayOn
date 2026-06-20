import Skeleton from "react-loading-skeleton";
import { useParams } from "react-router";
import { useEffect, useState } from "react";
import LightPillar from "../components/LightPillar/LightPillar.jsx";
import axiosClient from "../utils/axios-client";
import { useAuthContext } from "../context/AuthProvider";

const AlterarEquipe = () => {
  const { codigo } = useParams();
  const { user } = useAuthContext();
  const [equipe, setEquipe] = useState(null);
  const [membros, setMembros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState("");
  const [imagem, setImagem] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [imagemPreview, setImagemPreview] = useState(null);
  const [solicitacaoPendente, setSolicitacaoPendente] = useState(false);
  const [minhaParticipacaoAprovada, setMinhaParticipacaoAprovada] =
    useState(false);

  const usuarioLogado =
    user ||
    (() => {
      try {
        return JSON.parse(localStorage.getDecryptedItem("auth_user"));
      } catch {
        return null;
      }
    })();

  const usuarioLogadoId = Number(
    usuarioLogado?.id ||
      usuarioLogado?.codigo ||
      usuarioLogado?.codigoUsuario ||
      0,
  );

  const baseUrl = (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_BASE_URL ||
    ""
  ).replace(/\/api\/v\d+\/?$/i, "");

  const normalizeImageUrl = (url) => {
    if (!url) return null;

    if (/^https?:\/\//i.test(url)) {
      return url.replace(
        /^https?:\/\/localhost(?::\d+)?/i,
        baseUrl || "http://localhost:8000",
      );
    }

    return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const getImageUrl = (value, fallbackStoragePath = null) => {
    const normalized = normalizeImageUrl(value);
    if (normalized) return normalized;

    if (fallbackStoragePath) {
      return `${baseUrl}${fallbackStoragePath.startsWith("/") ? "" : "/"}${fallbackStoragePath}`;
    }

    return "/imagens/foto.png";
  };

  const avatarUrl =
    imagemPreview ||
    getImageUrl(
      equipe?.imagem_url || equipe?.foto_url || equipe?.avatar_url,
      equipe?.imagem ? `storage/equipes/${equipe.imagem}` : null,
    );

  const isOwner =
    equipe &&
    Number(equipe.administrador ?? equipe.dono ?? equipe.usuario_id ?? 0) ===
      usuarioLogadoId;

  useEffect(() => {
    const fetch = async () => {
      setCarregando(true);
      try {
        const res = await axiosClient.get(`/equipes/${codigo}`);
        let data = res.data;
        if (data && data.data) data = data.data;

        setEquipe(data);
        setNome(data.nome || "");
        setDescricao(data.descricao || "");
        setTipo(data.tipo ? "publico" : "privado");

        const membrosUrl = isOwner
          ? `/equipes/${codigo}/membros?include_pending=1`
          : `/equipes/${codigo}/membros`;

        try {
          const resMembers = await axiosClient.get(membrosUrl);
          const membrosData = Array.isArray(resMembers.data)
            ? resMembers.data
            : resMembers.data?.data || [];
          setMembros(membrosData);
          const meuVinculo = membrosData.find(
            (m) => m.id_usuario === usuarioLogadoId && !m.is_owner,
          );
          setSolicitacaoPendente(Boolean(meuVinculo));
          setMinhaParticipacaoAprovada(Boolean(meuVinculo?.aprovado));
        } catch {
          setMembros([]);
          setSolicitacaoPendente(false);
          setMinhaParticipacaoAprovada(false);
        }
      } catch {
        setEquipe(null);
      } finally {
        setCarregando(false);
      }
    };

    fetch();
  }, [codigo, isOwner, usuarioLogadoId]);

  useEffect(() => {
    return () => {
      if (imagemPreview) {
        URL.revokeObjectURL(imagemPreview);
      }
    };
  }, [imagemPreview]);

  if (!carregando && equipe === null) {
    return <p className="text-center text-white">Equipe não encontrada.</p>;
  }

  const recarregarMembros = async () => {
    const res = await axiosClient.get(
      isOwner
        ? `/equipes/${codigo}/membros?include_pending=1`
        : `/equipes/${codigo}/membros`,
    );
    const membrosData = Array.isArray(res.data)
      ? res.data
      : res.data?.data || [];
    setMembros(membrosData);
    const meuVinculo = membrosData.find(
      (m) => m.id_usuario === usuarioLogadoId && !m.is_owner,
    );
    setSolicitacaoPendente(Boolean(meuVinculo));
    setMinhaParticipacaoAprovada(Boolean(meuVinculo?.aprovado));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("nome", nome);
      formData.append("descricao", descricao);
      if (tipo === "publico") formData.append("tipo", "1");
      if (imagem) formData.append("imagem", imagem);
      formData.append("_method", "PUT");

      await axiosClient.post(`/equipes/${codigo}`, formData);
      setMensagem("Atualizado com sucesso");
      window.location.reload();
    } catch (error) {
      setMensagem(error?.response?.data?.message || "Erro ao atualizar");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Deseja realmente deletar esta equipe?")) return;
    try {
      await axiosClient.delete(`/equipes/${codigo}`);
      window.location.href = "/equipes";
    } catch (error) {
      setMensagem(error?.response?.data?.message || "Erro ao deletar");
    }
  };

  const handleSolicitarParticipacao = async () => {
    try {
      await axiosClient.post(`/equipes/${codigo}/membros`, {
        id_equipe: codigo,
      });
      setMensagem(
        tipo === "publico"
          ? "Você entrou na equipe com sucesso."
          : "Solicitação enviada para o administrador da equipe.",
      );
      await recarregarMembros();
    } catch (error) {
      setMensagem(error?.response?.data?.message || "Erro ao solicitar");
    }
  };

  const handleAprovarMembro = async (membroId) => {
    try {
      await axiosClient.put(`/membros/${membroId}`, { aprovado: true });
      setMensagem("Membro aprovado com sucesso!");
      await recarregarMembros();
    } catch (error) {
      setMensagem(error?.response?.data?.message || "Erro ao aprovar membro");
    }
  };

  const handleRemoverMembro = async (membroId) => {
    if (!confirm("Deseja remover este membro?")) return;
    try {
      await axiosClient.delete(`/membros/${membroId}`);
      setMensagem("Membro removido com sucesso!");
      await recarregarMembros();
    } catch (error) {
      setMensagem(error?.response?.data?.message || "Erro ao remover membro");
    }
  };

  const handleSairEquipe = async () => {
    try {
      await axiosClient.post(`/equipes/${codigo}/sair`);
      setMensagem(
        minhaParticipacaoAprovada
          ? "Você saiu da equipe com sucesso."
          : "Solicitação cancelada com sucesso.",
      );
      await recarregarMembros();
    } catch (error) {
      setMensagem(error?.response?.data?.message || "Erro ao sair da equipe");
    }
  };

  const membrosVisiveis = isOwner
    ? membros
    : membros.filter((membro) => membro.aprovado);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-x-hidden bg-black font-sans text-white">
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

      <section className="relative z-10 mx-4 w-full max-w-2xl rounded-2xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-md">
        <button
          onClick={() => window.history.back()}
          className="mb-4 inline-block rounded-md border-2 border-[#c09318] px-3 py-2 font-bold text-[#c09318]"
        >
          ← Voltar
        </button>

        <div className="mb-4 flex flex-col items-center">
          <img
            src={avatarUrl}
            alt={nome || "Equipe"}
            className="h-40 w-40 rounded-2xl border border-[#c09318] object-cover shadow-lg"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = "/imagens/foto.png";
            }}
          />
        </div>

        {carregando ? (
          <div className="flex flex-col">
            <Skeleton height={24} width="60%" className="mx-auto mb-4" />
            <Skeleton height={40} className="mb-3" />
            <Skeleton height={90} className="mb-3" />
            <Skeleton height={40} className="mb-3" />
            <Skeleton height={40} className="mb-3" />
            <Skeleton height={80} className="mb-3" />
            <div className="flex gap-2">
              <Skeleton height={44} className="flex-1" />
              <Skeleton height={44} className="flex-1" />
            </div>
          </div>
        ) : isOwner ? (
          <form
            onSubmit={handleUpdate}
            encType="multipart/form-data"
            className="flex flex-col"
          >
            <h2 className="mb-2 text-center text-xl font-semibold">
              Alterar Equipe
            </h2>

            <label className="text-sm text-gray-400">Nome:</label>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="mb-3 rounded-md border border-white/10 bg-white/5 p-3 text-sm text-white outline-none backdrop-blur-sm placeholder:text-gray-400 focus:border-[#c09318] focus:ring-1 focus:ring-[#c09318]"
            />

            <label className="text-sm text-gray-400">Descrição:</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="mb-3 min-h-28 rounded-md border border-white/10 bg-white/5 p-3 text-sm text-white outline-none backdrop-blur-sm placeholder:text-gray-400 focus:border-[#c09318] focus:ring-1 focus:ring-[#c09318]"
            />

            <label className="text-sm text-gray-400">Tipo:</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="mb-3 rounded-md border border-white/10 bg-white/5 p-3 text-sm text-white outline-none backdrop-blur-sm focus:border-[#c09318] focus:ring-1 focus:ring-[#c09318]"
            >
              <option value="publico">Público</option>
              <option value="privado">Privado</option>
            </select>

            <label className="text-sm text-gray-400">Foto:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                setImagem(file);
                if (file) setImagemPreview(URL.createObjectURL(file));
                else setImagemPreview(null);
              }}
              className="mb-3 rounded-md border border-white/10 bg-white/5 p-2 text-sm text-white backdrop-blur-sm"
            />

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 rounded bg-[#81700e] py-2"
              >
                Salvar mudanças
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 rounded bg-red-600 py-2"
              >
                Deletar
              </button>
            </div>

            {membrosVisiveis.length > 0 && (
              <div className="mt-6 rounded-md border border-white/10 bg-white/5 p-4 text-sm backdrop-blur-sm">
                <h3 className="mb-3 font-semibold text-[#c7c7c7]">
                  Membros da Equipe:
                </h3>
                <ul className="divide-y divide-white/10">
                  {membrosVisiveis.map((membro) => (
                    <li
                      key={membro.id}
                      className="flex items-center justify-between py-3 text-white"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={getImageUrl(
                            membro.usuario?.imagem_url ||
                              membro.usuario?.foto_url ||
                              membro.usuario?.avatar_url,
                            membro.usuario?.imagem
                              ? `storage/usuarios/${membro.usuario.imagem}`
                              : null,
                          )}
                          alt={membro.usuario?.apelido || "Usuário"}
                          className="h-10 w-10 rounded-full border border-[#c09318] object-cover"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = "/imagens/foto.png";
                          }}
                        />
                        <div>
                          <p className="font-medium">
                            {membro.usuario?.apelido}
                          </p>
                          <p className="text-xs text-gray-400">
                            {membro.is_owner
                              ? "★ Dono"
                              : membro.aprovado
                                ? "✓ Aprovado"
                                : "⧗ Pendente"}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!membro.aprovado && !membro.is_owner && (
                          <button
                            type="button"
                            onClick={() => handleAprovarMembro(membro.id)}
                            className="rounded bg-green-600 px-2 py-1 text-xs"
                          >
                            Aprovar
                          </button>
                        )}
                        {!membro.is_owner && (
                          <button
                            type="button"
                            onClick={() => handleRemoverMembro(membro.id)}
                            className="rounded bg-red-600 px-2 py-1 text-xs"
                          >
                            Remover
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {mensagem && (
              <div className="mt-3 text-sm text-green-300">{mensagem}</div>
            )}
          </form>
        ) : (
          <div className="flex flex-col gap-3">
            <h2 className="text-center text-xl font-semibold">{nome}</h2>
            <p className="text-sm text-gray-300">{descricao}</p>
            <p className="text-sm text-gray-400">
              Tipo: {tipo === "publico" ? "Público" : "Privado"}
            </p>

            {membrosVisiveis.length > 0 && (
              <div className="mt-2 rounded-md border border-white/10 bg-white/5 p-4 text-sm backdrop-blur-sm">
                <h3 className="mb-3 font-semibold text-[#c7c7c7]">
                  Quem faz parte da equipe:
                </h3>
                <ul className="divide-y divide-white/10">
                  {membrosVisiveis.map((membro) => (
                    <li key={membro.id} className="py-2 text-white">
                      <div className="flex items-center gap-3">
                        <img
                          src={getImageUrl(
                            membro.usuario?.imagem_url ||
                              membro.usuario?.foto_url ||
                              membro.usuario?.avatar_url,
                            membro.usuario?.imagem
                              ? `storage/usuarios/${membro.usuario.imagem}`
                              : null,
                          )}
                          alt={membro.usuario?.apelido || "Usuário"}
                          className="h-10 w-10 rounded-full border border-[#c09318] object-cover"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = "/imagens/foto.png";
                          }}
                        />
                        <p className="font-medium">
                          {membro.usuario?.apelido}
                          {membro.is_owner ? " (Dono)" : ""}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {solicitacaoPendente ? (
              <button
                type="button"
                className="mt-2 rounded bg-red-600 py-2 font-semibold"
                onClick={handleSairEquipe}
              >
                {minhaParticipacaoAprovada
                  ? "Sair da equipe"
                  : "Cancelar solicitação"}
              </button>
            ) : (
              <button
                type="button"
                className="mt-2 rounded bg-[#81700e] py-2 font-semibold"
                onClick={handleSolicitarParticipacao}
              >
                {tipo === "publico"
                  ? "Entrar na equipe"
                  : "Solicitar participação"}
              </button>
            )}

            {mensagem && (
              <div className="mt-2 text-sm text-green-300">{mensagem}</div>
            )}
          </div>
        )}
      </section>
    </main>
  );
};

export default AlterarEquipe;
