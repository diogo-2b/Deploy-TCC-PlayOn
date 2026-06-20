import Skeleton from "react-loading-skeleton";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";
import LightPillar from "../components/LightPillar/LightPillar.jsx";
import { useAuthContext } from "../context/AuthProvider";
import { useSessoes } from "../context/SessoesProvider";
import axiosClient from "../utils/axios-client";

const AlterarSessao = () => {
  const { codigo } = useParams();
  const { user } = useAuthContext();
  const [sessao, setSessao] = useState(null);
  const [jogadores, setJogadores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [jogo, setJogo] = useState("");
  const [maxJogadores, setMaxJogadores] = useState(5);
  const [status, setStatus] = useState("aberta");
  const [mensagem, setMensagem] = useState("");
  const [erros, setErros] = useState({});
  const { atualizarSessao, deletarSessao } = useSessoes();

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

  const carregarJogadores = useCallback(async () => {
    try {
      const res = await axiosClient.get(`/sessoes/${codigo}/jogadores`);
      const lista = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setJogadores(lista);
    } catch {
      setJogadores([]);
    }
  }, [codigo]);

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true);
      try {
        const res = await axiosClient.get(`/sessoes/${codigo}`);
        const data = res.data?.data || res.data;
        setSessao(data);
        setTitulo(data?.titulo || "");
        setDescricao(data?.descricao || "");
        setJogo(data?.jogo || "");
        setMaxJogadores(data?.max_jogadores || 5);
        setStatus(data?.status || "aberta");
      } catch {
        setSessao(null);
      } finally {
        setCarregando(false);
      }
    };

    carregar();
  }, [codigo]);

  useEffect(() => {
    if (codigo) {
      carregarJogadores();
    }
  }, [codigo, carregarJogadores]);

  if (!carregando && sessao === null) {
    return <p className="text-center text-white">Sessão não encontrada.</p>;
  }

  const criadorId = Number(sessao?.criador_id ?? sessao?.criador?.id ?? 0);
  const isOwner = criadorId > 0 && criadorId === usuarioLogadoId;
  const minhaInscricao = jogadores.some(
    (jogador) => Number(jogador.id) === usuarioLogadoId,
  );
  const qtdJogadores = Array.isArray(jogadores) ? jogadores.length : 0;
  const capacidadeCheia =
    qtdJogadores >= Number(sessao?.max_jogadores || maxJogadores || 0);

  const validarFormulario = () => {
    const novosErros = {};
    if (!titulo.trim()) novosErros.titulo = "O título é obrigatório.";
    if (!descricao.trim()) novosErros.descricao = "A descrição é obrigatória.";
    if (!jogo.trim()) novosErros.jogo = "O jogo é obrigatório.";
    if (!maxJogadores || Number(maxJogadores) < 1) {
      novosErros.maxJogadores = "Informe um número válido de jogadores.";
    }
    return novosErros;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setErros({});

    const errosValidacao = validarFormulario();
    if (Object.keys(errosValidacao).length > 0) {
      setErros(errosValidacao);
      return;
    }

    try {
      await atualizarSessao(codigo, {
        titulo,
        descricao,
        jogo,
        max_jogadores: Number(maxJogadores),
        status,
      });
      setMensagem("Atualizado com sucesso");
      window.location.reload();
    } catch (error) {
      setMensagem(error?.response?.data?.message || "Erro ao atualizar");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Deseja realmente deletar esta sessão?")) return;
    try {
      await deletarSessao(codigo);
      window.location.href = "/sessoes";
    } catch (error) {
      setMensagem(error?.response?.data?.message || "Erro ao deletar");
    }
  };

  const handleInscrever = async () => {
    try {
      await axiosClient.post(`/sessoes/${codigo}/jogadores`, {
        usuario_id: usuarioLogadoId,
      });
      setMensagem("Você entrou na sessão com sucesso.");
      await carregarJogadores();
    } catch (error) {
      setMensagem(
        error?.response?.data?.message || "Erro ao inscrever-se na sessão",
      );
    }
  };

  const handleSair = async () => {
    try {
      await axiosClient.delete(
        `/sessoes/${codigo}/jogadores/${usuarioLogadoId}`,
      );
      setMensagem("Você saiu da sessão com sucesso.");
      await carregarJogadores();
    } catch (error) {
      setMensagem(error?.response?.data?.message || "Erro ao sair da sessão");
    }
  };

  const handleRemoverJogador = async (jogadorId) => {
    if (!confirm("Deseja remover este jogador da sessão?")) return;
    try {
      await axiosClient.delete(`/sessoes/${codigo}/jogadores/${jogadorId}`);
      setMensagem("Jogador removido com sucesso.");
      await carregarJogadores();
    } catch (error) {
      setMensagem(
        error?.response?.data?.message || "Erro ao remover jogador da sessão",
      );
    }
  };

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

        {carregando ? (
          <div className="flex flex-col">
            <Skeleton height={24} width="60%" className="mx-auto mb-4" />
            <Skeleton height={40} className="mb-3" />
            <Skeleton height={90} className="mb-3" />
            <Skeleton height={40} className="mb-3" />
            <Skeleton height={40} className="mb-3" />
            <Skeleton height={40} className="mb-3" />
            <div className="flex gap-2">
              <Skeleton height={44} className="flex-1" />
              <Skeleton height={44} className="flex-1" />
            </div>
          </div>
        ) : isOwner ? (
          <form onSubmit={handleUpdate} className="flex flex-col">
            <h2 className="mb-2 text-center text-xl font-semibold">
              Alterar Sessão
            </h2>

            <label className="text-sm text-gray-400">Título:</label>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className={`mb-3 rounded-md border bg-white/5 p-3 text-sm text-white outline-none backdrop-blur-sm ${erros.titulo ? "border-red-500" : "border-white/10 focus:border-[#c09318] focus:ring-1 focus:ring-[#c09318]"}`}
            />
            {erros.titulo && (
              <div className="mb-3 text-sm text-red-500">{erros.titulo}</div>
            )}

            <label className="text-sm text-gray-400">Descrição:</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className={`mb-3 min-h-28 rounded-md border bg-white/5 p-3 text-sm text-white outline-none backdrop-blur-sm ${erros.descricao ? "border-red-500" : "border-white/10 focus:border-[#c09318] focus:ring-1 focus:ring-[#c09318]"}`}
            />
            {erros.descricao && (
              <div className="mb-3 text-sm text-red-500">{erros.descricao}</div>
            )}

            <label className="text-sm text-gray-400">Jogo:</label>
            <input
              value={jogo}
              onChange={(e) => setJogo(e.target.value)}
              className={`mb-3 rounded-md border bg-white/5 p-3 text-sm text-white outline-none backdrop-blur-sm ${erros.jogo ? "border-red-500" : "border-white/10 focus:border-[#c09318] focus:ring-1 focus:ring-[#c09318]"}`}
            />
            {erros.jogo && (
              <div className="mb-3 text-sm text-red-500">{erros.jogo}</div>
            )}

            <label className="text-sm text-gray-400">Máx. de jogadores:</label>
            <input
              type="number"
              min="1"
              value={maxJogadores}
              onChange={(e) => setMaxJogadores(e.target.value)}
              className={`mb-3 rounded-md border bg-white/5 p-3 text-sm text-white outline-none backdrop-blur-sm ${erros.maxJogadores ? "border-red-500" : "border-white/10 focus:border-[#c09318] focus:ring-1 focus:ring-[#c09318]"}`}
            />
            {erros.maxJogadores && (
              <div className="mb-3 text-sm text-red-500">
                {erros.maxJogadores}
              </div>
            )}

            <label className="text-sm text-gray-400">Status:</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mb-4 rounded-md border border-white/10 bg-white/5 p-3 text-sm text-white outline-none backdrop-blur-sm focus:border-[#c09318] focus:ring-1 focus:ring-[#c09318]"
            >
              <option value="aberta">Aberta</option>
              <option value="fechada">Fechada</option>
              <option value="encerrada">Encerrada</option>
            </select>

            <button
              type="submit"
              className="mb-3 rounded-md bg-[#81700e] py-3 text-sm text-white transition hover:bg-[#978e0f]"
            >
              Salvar alterações
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="rounded-md border border-red-500 py-3 text-sm text-red-400 transition hover:bg-red-500/10"
            >
              Excluir sessão
            </button>

            {jogadores.length > 0 && (
              <div className="mt-6 rounded-md border border-white/10 bg-white/5 p-4 text-sm backdrop-blur-sm">
                <h3 className="mb-3 font-semibold text-[#c7c7c7]">
                  Jogadores inscritos
                </h3>
                <ul className="divide-y divide-white/10">
                  {jogadores.map((jogador) => (
                    <li
                      key={jogador.id}
                      className="flex items-center justify-between py-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={getImageUrl(
                            jogador.imagem_url ||
                              jogador.foto_url ||
                              jogador.avatar_url,
                            jogador.imagem
                              ? `storage/usuarios/${jogador.imagem}`
                              : null,
                          )}
                          alt={
                            jogador.apelido ||
                            jogador.nome ||
                            `Usuário #${jogador.id}`
                          }
                          className="h-10 w-10 rounded-full border border-[#c09318] object-cover"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = "/imagens/foto.png";
                          }}
                        />
                        <div>
                          <p className="font-medium">
                            {jogador.apelido ||
                              jogador.nome ||
                              `Usuário #${jogador.id}`}
                          </p>
                          <p className="text-xs text-gray-400">
                            {Number(jogador.id) === criadorId
                              ? "Dono"
                              : "Participante"}
                          </p>
                        </div>
                      </div>
                      {Number(jogador.id) !== criadorId && (
                        <button
                          type="button"
                          onClick={() => handleRemoverJogador(jogador.id)}
                          className="rounded bg-red-600 px-2 py-1 text-xs"
                        >
                          Remover
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {mensagem && (
              <div className="mt-3 text-sm text-green-400">{mensagem}</div>
            )}
          </form>
        ) : (
          <div className="flex flex-col gap-3">
            <h2 className="mb-2 text-center text-xl font-semibold">{titulo}</h2>

            <p className="text-sm text-gray-300">{descricao}</p>
            <p className="text-sm text-gray-400">Jogo: {jogo}</p>
            <p className="text-sm text-gray-400">
              Status: {sessao?.status_label || status}
            </p>
            <p className="text-sm text-gray-400">
              Lotação: {qtdJogadores}/{sessao?.max_jogadores || maxJogadores}
            </p>

            {jogadores.length > 0 && (
              <div className="mt-2 rounded-md border border-white/10 bg-white/5 p-4 text-sm backdrop-blur-sm">
                <h3 className="mb-3 font-semibold text-[#c7c7c7]">
                  Jogadores inscritos
                </h3>
                <ul className="divide-y divide-white/10">
                  {jogadores.map((jogador) => (
                    <li key={jogador.id} className="py-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={getImageUrl(
                            jogador.imagem_url ||
                              jogador.foto_url ||
                              jogador.avatar_url,
                            jogador.imagem
                              ? `storage/usuarios/${jogador.imagem}`
                              : null,
                          )}
                          alt={
                            jogador.apelido ||
                            jogador.nome ||
                            `Usuário #${jogador.id}`
                          }
                          className="h-10 w-10 rounded-full border border-[#c09318] object-cover"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = "/imagens/foto.png";
                          }}
                        />
                        <p className="font-medium">
                          {jogador.apelido ||
                            jogador.nome ||
                            `Usuário #${jogador.id}`}
                          {Number(jogador.id) === criadorId ? " (Dono)" : ""}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {minhaInscricao ? (
              <button
                type="button"
                className="mt-2 rounded bg-red-600 py-2 font-semibold"
                onClick={handleSair}
              >
                Sair da sessão
              </button>
            ) : (
              <button
                type="button"
                className="mt-2 rounded bg-[#81700e] py-2 font-semibold disabled:cursor-not-allowed disabled:bg-gray-500"
                onClick={handleInscrever}
                disabled={capacidadeCheia}
              >
                {capacidadeCheia ? "Sessão lotada" : "Inscrever-se"}
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

export default AlterarSessao;
