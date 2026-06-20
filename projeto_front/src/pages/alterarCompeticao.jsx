import Skeleton from "react-loading-skeleton";
import { useParams } from "react-router";
import { useCallback, useEffect, useState } from "react";
import LightPillar from "../components/LightPillar/LightPillar.jsx";
import axiosClient from "../utils/axios-client";
import { useAuthContext } from "../context/AuthProvider";

const AlterarCompeticao = () => {
  const { codigo } = useParams();
  const { user } = useAuthContext();
  const [competicao, setCompeticao] = useState(null);
  const [participantes, setParticipantes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState("");
  const [inscricao, setInscricao] = useState("");
  const [imagem, setImagem] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [imagemPreview, setImagemPreview] = useState(null);
  const [statusInscricaoPessoa, setStatusInscricaoPessoa] = useState(null);
  const [equipesUsuario, setEquipesUsuario] = useState([]);
  const [equipeSelecionadaId, setEquipeSelecionadaId] = useState("");

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
      competicao?.imagem_url || competicao?.foto_url || competicao?.avatar_url,
      competicao?.imagem ? `storage/competicoes/${competicao.imagem}` : null,
    );

  const isOwner =
    competicao &&
    Number(competicao.dono ?? competicao.usuario_id ?? 0) === usuarioLogadoId;

  const carregarParticipantes = useCallback(
    async (owner = isOwner) => {
      const resParticipantes = await axiosClient.get(
        `/competicoes/${codigo}/participantes${owner ? "?include_pending=1" : ""}`,
      );
      const participantesData = Array.isArray(resParticipantes.data)
        ? resParticipantes.data
        : resParticipantes.data?.data || [];

      setParticipantes(participantesData);

      const minhaParticipacaoPessoa = participantesData.find(
        (p) =>
          p.tipo_participante === "usuario" &&
          Number(p.id_participante) === usuarioLogadoId,
      );

      setStatusInscricaoPessoa(
        minhaParticipacaoPessoa
          ? minhaParticipacaoPessoa.aprovado
            ? "aprovado"
            : "pendente"
          : null,
      );
    },
    [codigo, isOwner, usuarioLogadoId],
  );

  // Buscar dados da competição e participantes
  useEffect(() => {
    const fetch = async () => {
      setCarregando(true);
      try {
        const res = await axiosClient.get(`/competicoes/${codigo}`);
        let data = res.data;
        if (data && data.data) data = data.data;
        setCompeticao(data);
        setNome(data.nome || "");
        setDescricao(data.descricao || "");
        setTipo(data.tipo ? "publico" : "privado");
        setInscricao(data.inscricao ? "equipe" : "pessoa");

        const owner =
          Number(data.dono ?? data.usuario_id ?? 0) === usuarioLogadoId;

        // Buscar participantes da competição
        try {
          await carregarParticipantes(owner);
        } catch {
          setParticipantes([]);
          setStatusInscricaoPessoa(null);
        }

        if (data.inscricao) {
          try {
            const resEquipes = await axiosClient.get("/minhas-equipes");
            const equipesData = Array.isArray(resEquipes.data)
              ? resEquipes.data
              : resEquipes.data?.data || [];
            setEquipesUsuario(equipesData);
            if (equipesData.length > 0) {
              setEquipeSelecionadaId(String(equipesData[0].id));
            }
          } catch {
            setEquipesUsuario([]);
          }
        }
      } catch {
        setCompeticao(null);
      } finally {
        setCarregando(false);
      }
    };
    fetch();
  }, [codigo, usuarioLogadoId, carregarParticipantes]);

  useEffect(() => {
    return () => {
      if (imagemPreview) {
        URL.revokeObjectURL(imagemPreview);
      }
    };
  }, [imagemPreview]);

  if (!carregando && competicao === null) {
    return <p className="text-center text-white">Competição não encontrada.</p>;
  }

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("nome", nome);
      formData.append("descricao", descricao);
      if (tipo === "publico") formData.append("tipo", "1");
      if (inscricao === "equipe") formData.append("inscricao", "1");
      if (imagem) formData.append("imagem", imagem);

      formData.append("_method", "PUT");

      await axiosClient.post(`/competicoes/${codigo}`, formData);

      setMensagem("Atualizado com sucesso");
      window.location.reload();
    } catch (error) {
      setMensagem(error?.response?.data?.message || "Erro ao atualizar");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Deseja realmente deletar esta competição?")) return;
    try {
      await axiosClient.delete(`/competicoes/${codigo}`);
      window.location.href = "/competicoes";
    } catch (error) {
      setMensagem(error?.response?.data?.message || "Erro ao deletar");
    }
  };

  const handleInscrever = async () => {
    try {
      const resInscricao = await axiosClient.post(
        `/competicoes/${codigo}/participantes`,
        {
          id_competicao: codigo,
          id_participante: usuarioLogadoId,
          tipo_participante: "usuario",
        },
      );

      const aprovado = Boolean(resInscricao.data?.aprovado);
      setMensagem(
        aprovado
          ? "Inscrição realizada com sucesso!"
          : "Inscrição enviada e aguardando aprovação.",
      );
      await carregarParticipantes(false);
    } catch (error) {
      setMensagem(error?.response?.data?.message || "Erro ao inscrever");
    }
  };

  const handleInscreverEquipe = async () => {
    if (!equipeSelecionadaId) {
      setMensagem("Selecione uma equipe antes de se inscrever.");
      return;
    }

    try {
      await axiosClient.post(`/competicoes/${codigo}/participantes`, {
        id_competicao: codigo,
        id_participante: Number(equipeSelecionadaId),
        tipo_participante: "equipe",
      });
      setMensagem(
        tipo === "publico"
          ? "Equipe inscrita com sucesso!"
          : "Solicitação de equipe enviada com sucesso!",
      );
      await carregarParticipantes(false);
    } catch (error) {
      setMensagem(error?.response?.data?.message || "Erro ao inscrever equipe");
    }
  };

  const handleAprovarParticipante = async (participanteId) => {
    try {
      await axiosClient.put(`/participantes/${participanteId}`, {
        aprovado: true,
      });
      setMensagem("Participante aprovado com sucesso!");
      await carregarParticipantes(true);
    } catch (error) {
      setMensagem(error?.response?.data?.message || "Erro ao aprovar");
    }
  };

  const handleRemoverParticipante = async (participanteId) => {
    if (!confirm("Deseja remover este participante?")) return;
    try {
      await axiosClient.delete(`/participantes/${participanteId}`);
      setMensagem("Participante removido com sucesso!");
      await carregarParticipantes(isOwner);
    } catch (error) {
      setMensagem(error?.response?.data?.message || "Erro ao remover");
    }
  };

  const handleSairCompeticaoUsuario = async () => {
    try {
      await axiosClient.post(`/competicoes/${codigo}/sair`, {
        tipo_participante: "usuario",
      });
      setMensagem(
        statusInscricaoPessoa === "pendente"
          ? "Solicitação cancelada com sucesso."
          : "Você saiu da competição com sucesso.",
      );
      await carregarParticipantes(false);
    } catch (error) {
      setMensagem(
        error?.response?.data?.message || "Erro ao sair da competição",
      );
    }
  };

  const handleRetirarEquipeDaCompeticao = async () => {
    if (!equipeSelecionadaId) return;

    try {
      await axiosClient.post(`/competicoes/${codigo}/sair`, {
        tipo_participante: "equipe",
        id_participante: Number(equipeSelecionadaId),
      });
      setMensagem("Equipe removida da competição com sucesso.");
      await carregarParticipantes(false);
    } catch (error) {
      setMensagem(
        error?.response?.data?.message ||
          "Erro ao remover equipe da competição",
      );
    }
  };

  const participantesVisiveis = isOwner
    ? participantes
    : participantes.filter((participante) => participante.aprovado);

  const participacaoEquipeSelecionada = participantes.find(
    (p) =>
      p.tipo_participante === "equipe" &&
      Number(p.id_participante) === Number(equipeSelecionadaId),
  );

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
          className="mb-4 inline-block border-2 border-[#c09318] text-[#c09318] px-3 py-2 rounded-md font-bold"
        >
          ← Voltar
        </button>

        <div className="mb-4 flex flex-col items-center">
          <img
            src={avatarUrl}
            alt={nome || "Competição"}
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
            <h2 className="text-center text-xl font-semibold mb-2">
              Alterar Competição
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

            <label className="text-sm text-gray-400">Inscrição:</label>
            <select
              value={inscricao}
              onChange={(e) => setInscricao(e.target.value)}
              className="mb-3 rounded-md border border-white/10 bg-white/5 p-3 text-sm text-white outline-none backdrop-blur-sm focus:border-[#c09318] focus:ring-1 focus:ring-[#c09318]"
            >
              <option value="pessoa">Individual</option>
              <option value="equipe">Equipes</option>
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
                className="flex-1 bg-[#81700e] py-2 rounded"
              >
                Salvar mudanças
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 bg-red-600 py-2 rounded"
              >
                Deletar
              </button>
            </div>

            {participantesVisiveis && participantesVisiveis.length > 0 && (
              <div className="mt-6 rounded-md border border-white/10 bg-white/5 p-4 text-sm backdrop-blur-sm">
                <h3 className="mb-3 font-semibold text-[#c7c7c7]">
                  {isOwner ? "Participantes:" : "Quem faz parte da competição:"}
                </h3>
                <ul className="divide-y divide-white/10">
                  {participantesVisiveis.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between py-3 text-white"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            p.tipo_participante === "usuario"
                              ? getImageUrl(
                                  p.participante?.imagem_url ||
                                    p.participante?.foto_url ||
                                    p.participante?.avatar_url,
                                  p.participante?.imagem
                                    ? `storage/usuarios/${p.participante.imagem}`
                                    : null,
                                )
                              : getImageUrl(
                                  p.equipe?.imagem_url ||
                                    p.equipe?.foto_url ||
                                    p.equipe?.avatar_url,
                                  p.equipe?.imagem
                                    ? `storage/equipes/${p.equipe.imagem}`
                                    : null,
                                )
                          }
                          alt={
                            p.tipo_participante === "usuario"
                              ? p.participante?.apelido || "Usuário"
                              : p.equipe?.nome || "Equipe"
                          }
                          className="h-10 w-10 rounded-full border border-[#c09318] object-cover"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = "/imagens/foto.png";
                          }}
                        />
                        <div>
                          <p className="font-medium">
                            {p.tipo_participante === "usuario"
                              ? p.participante?.apelido
                              : p.equipe?.nome}
                          </p>
                          {isOwner && (
                            <p className="text-xs text-gray-400">
                              {p.tipo_participante === "usuario"
                                ? "Usuário"
                                : "Equipe"}{" "}
                              {p.aprovado ? "✓ Aprovado" : "⧗ Pendente"}
                            </p>
                          )}
                        </div>
                      </div>
                      {isOwner && (
                        <div className="flex gap-2">
                          {!p.aprovado && (
                            <button
                              type="button"
                              onClick={() => handleAprovarParticipante(p.id)}
                              className="bg-green-600 px-2 py-1 rounded text-xs"
                            >
                              Aprovar
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoverParticipante(p.id)}
                            className="bg-red-600 px-2 py-1 rounded text-xs"
                          >
                            Remover
                          </button>
                        </div>
                      )}
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
            <p className="text-sm text-gray-400">
              Inscrição: {inscricao === "equipe" ? "Equipes" : "Individual"}
            </p>

            {participantesVisiveis && participantesVisiveis.length > 0 && (
              <div className="mt-2 rounded-md border border-white/10 bg-white/5 p-4 text-sm backdrop-blur-sm">
                <h3 className="mb-3 font-semibold text-[#c7c7c7]">
                  Quem faz parte da competição:
                </h3>
                <ul className="divide-y divide-white/10">
                  {participantesVisiveis.map((p) => (
                    <li key={p.id} className="py-2 text-white">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            p.tipo_participante === "usuario"
                              ? getImageUrl(
                                  p.participante?.imagem_url ||
                                    p.participante?.foto_url ||
                                    p.participante?.avatar_url,
                                  p.participante?.imagem
                                    ? `storage/usuarios/${p.participante.imagem}`
                                    : null,
                                )
                              : getImageUrl(
                                  p.equipe?.imagem_url ||
                                    p.equipe?.foto_url ||
                                    p.equipe?.avatar_url,
                                  p.equipe?.imagem
                                    ? `storage/equipes/${p.equipe.imagem}`
                                    : null,
                                )
                          }
                          alt={
                            p.tipo_participante === "usuario"
                              ? p.participante?.apelido || "Usuário"
                              : p.equipe?.nome || "Equipe"
                          }
                          className="h-10 w-10 rounded-full border border-[#c09318] object-cover"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = "/imagens/foto.png";
                          }}
                        />
                        <p className="font-medium">
                          {p.tipo_participante === "usuario"
                            ? p.participante?.apelido
                            : p.equipe?.nome}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {inscricao === "equipe" ? (
              <>
                <label className="text-sm text-gray-400">Sua equipe:</label>
                <select
                  value={equipeSelecionadaId}
                  onChange={(e) => setEquipeSelecionadaId(e.target.value)}
                  className="rounded bg-[#202225] p-2"
                  disabled={equipesUsuario.length === 0}
                >
                  {equipesUsuario.length === 0 ? (
                    <option value="">Você não possui equipes</option>
                  ) : (
                    equipesUsuario.map((equipe) => (
                      <option key={equipe.id} value={equipe.id}>
                        {equipe.nome}
                      </option>
                    ))
                  )}
                </select>

                {participacaoEquipeSelecionada ? (
                  <button
                    type="button"
                    className="mt-2 bg-red-600 py-2 rounded font-semibold"
                    onClick={handleRetirarEquipeDaCompeticao}
                  >
                    {participacaoEquipeSelecionada.aprovado
                      ? "Retirar equipe da competição"
                      : "Cancelar solicitação da equipe"}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="mt-2 bg-[#81700e] py-2 rounded font-semibold disabled:opacity-50"
                    onClick={handleInscreverEquipe}
                    disabled={equipesUsuario.length === 0}
                  >
                    {tipo === "publico"
                      ? "Inscrever equipe"
                      : "Solicitar inscrição da equipe"}
                  </button>
                )}
              </>
            ) : statusInscricaoPessoa ? (
              <button
                type="button"
                className="mt-2 bg-red-600 py-2 rounded font-semibold"
                onClick={handleSairCompeticaoUsuario}
              >
                {statusInscricaoPessoa === "pendente"
                  ? "Cancelar solicitação"
                  : "Sair da competição"}
              </button>
            ) : (
              <button
                type="button"
                className="mt-2 bg-[#81700e] py-2 rounded font-semibold"
                onClick={handleInscrever}
              >
                {tipo === "publico" ? "Inscrever-se" : "Solicitar inscrição"}
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

export default AlterarCompeticao;
