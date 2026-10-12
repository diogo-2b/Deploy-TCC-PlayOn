import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import LightPillar from "../components/LightPillar/LightPillar.jsx";
import { useSessoes } from "../context/SessoesProvider";
import axiosClient from "../utils/axios-client";

const CadastrarSessao = () => {
  const usuarioRaw = localStorage.getDecryptedItem("auth_user");
  const usuario = usuarioRaw ? JSON.parse(usuarioRaw) : {};

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [jogoSelecionado, setJogoSelecionado] = useState(null);
  const [buscaJogo, setBuscaJogo] = useState("");
  const [jogosEncontrados, setJogosEncontrados] = useState([]);
  const [carregandoJogos, setCarregandoJogos] = useState(false);
  const [erroBuscaJogo, setErroBuscaJogo] = useState("");
  const [maxJogadores, setMaxJogadores] = useState(5);
  const [status, setStatus] = useState("aberta");
  const [erros, setErros] = useState({});
  const [mensagem, setMensagem] = useState("");

  const navigate = useNavigate();
  const { adicionarSessao, loadSessoes } = useSessoes();

  useEffect(() => {
    const termo = buscaJogo.trim();
    if (termo.length < 2 || jogoSelecionado?.nome === termo) {
      setJogosEncontrados([]);
      setCarregandoJogos(false);
      return;
    }

    let cancelado = false;
    const timer = setTimeout(async () => {
      setCarregandoJogos(true);
      setErroBuscaJogo("");
      try {
        const response = await axiosClient.get("/jogos", {
          params: { search: termo },
        });
        if (!cancelado) {
          setJogosEncontrados(Array.isArray(response.data) ? response.data : []);
        }
      } catch {
        if (!cancelado) {
          setJogosEncontrados([]);
          setErroBuscaJogo("Não foi possível pesquisar jogos.");
        }
      } finally {
        if (!cancelado) setCarregandoJogos(false);
      }
    }, 350);

    return () => {
      cancelado = true;
      clearTimeout(timer);
    };
  }, [buscaJogo, jogoSelecionado]);

  const validarFormulario = () => {
    const novosErros = {};
    if (!titulo.trim()) novosErros.titulo = "O título é obrigatório.";
    if (!descricao.trim()) novosErros.descricao = "A descrição é obrigatória.";
    if (!jogoSelecionado) novosErros.jogo = "Selecione um jogo do catálogo.";
    if (!maxJogadores || Number(maxJogadores) < 1) {
      novosErros.maxJogadores = "Informe um número válido de jogadores.";
    }
    return novosErros;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem("");
    setErros({});

    const errosValidacao = validarFormulario();
    if (Object.keys(errosValidacao).length > 0) {
      setErros(errosValidacao);
      return;
    }

    try {
      const criadorId = usuario.id || usuario.codigo || null;
      const payload = {
        criador_id: criadorId,
        titulo,
        descricao,
        igdb_id: jogoSelecionado.igdb_id,
        jogo_nome: jogoSelecionado.nome,
        jogo_capa_url: jogoSelecionado.capa_url || null,
        max_jogadores: Number(maxJogadores),
        status,
      };

      if (!payload.criador_id) {
        throw new Error("Usuário autenticado não encontrado.");
      }

      await adicionarSessao(payload);

      try {
        await loadSessoes();
      } catch {
        // atualização local opcional
      }

      setMensagem("Cadastro realizado com sucesso!");
      setTimeout(() => navigate("/sessoes"), 800);
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao cadastrar sessão. Tente novamente.";
      setErros({ geral: msg });
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-x-hidden bg-gradient-to-t from-black to-[#daa520] font-sans text-white">
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

      <div className="relative z-10 mx-4 w-full max-w-2xl rounded-2xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-md md:p-10">
        <button
          onClick={() => window.history.back()}
          className="mb-4 inline-block border-2 border-[#c09318] text-[#c09318] px-3 py-2 rounded-md font-bold"
        >
          ← Voltar
        </button>
        <form
          id="formCadastro"
          onSubmit={handleSubmit}
          className="flex flex-col"
        >
          <h1 className="text-center text-xl font-semibold mb-2">PlayOn</h1>
          <h3 className="text-center text-sm text-gray-300 mb-6">
            Criando sua Sessão
          </h3>

          <div className="mb-4">
            <label
              htmlFor="titulo"
              className="block text-sm text-gray-300 mb-2"
            >
              Título:
            </label>
            <input
              type="text"
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className={`w-full p-3 bg-white/5 text-white text-sm rounded-md border outline-none placeholder:text-gray-400 backdrop-blur-sm ${erros.titulo ? "border-red-500" : "border-white/10 focus:border-[#c09318] focus:ring-1 focus:ring-[#c09318]"}`}
            />
            {erros.titulo && (
              <div className="text-red-500 text-sm mt-1">{erros.titulo}</div>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="descricao"
              className="block text-sm text-gray-300 mb-2"
            >
              Descrição:
            </label>
            <textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className={`w-full p-3 bg-white/5 text-white text-sm rounded-md border outline-none min-h-28 placeholder:text-gray-400 backdrop-blur-sm ${erros.descricao ? "border-red-500" : "border-white/10 focus:border-[#c09318] focus:ring-1 focus:ring-[#c09318]"}`}
            />
            {erros.descricao && (
              <div className="text-red-500 text-sm mt-1">{erros.descricao}</div>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="jogo" className="block text-sm text-gray-300 mb-2">
              Jogo:
            </label>
            <input
              type="text"
              id="jogo"
              value={buscaJogo}
              autoComplete="off"
              placeholder="Pesquise um jogo, ex.: Valorant"
              onChange={(e) => {
                setBuscaJogo(e.target.value);
                setJogoSelecionado(null);
              }}
              className={`w-full p-3 bg-white/5 text-white text-sm rounded-md border outline-none placeholder:text-gray-400 backdrop-blur-sm ${erros.jogo ? "border-red-500" : "border-white/10 focus:border-[#c09318] focus:ring-1 focus:ring-[#c09318]"}`}
            />
            {carregandoJogos && <p className="mt-2 text-sm text-gray-300">Pesquisando jogos...</p>}
            {erroBuscaJogo && <p className="mt-2 text-sm text-red-400">{erroBuscaJogo}</p>}
            {jogosEncontrados.length > 0 && !jogoSelecionado && (
              <div className="mt-2 max-h-60 overflow-y-auto rounded-lg border border-white/10 bg-black/90">
                {jogosEncontrados.map((item) => (
                  <button
                    key={item.igdb_id}
                    type="button"
                    onClick={() => {
                      setJogoSelecionado(item);
                      setBuscaJogo(item.nome);
                      setJogosEncontrados([]);
                      setErros((prev) => ({ ...prev, jogo: undefined }));
                    }}
                    className="flex w-full items-center gap-3 border-b border-white/10 p-3 text-left hover:bg-white/10"
                  >
                    {item.capa_url ? (
                      <img src={item.capa_url} alt={`Capa de ${item.nome}`} className="h-16 w-11 rounded object-cover" />
                    ) : <div className="h-16 w-11 rounded bg-white/10" />}
                    <span className="flex-1 font-semibold">{item.nome}</span>
                    <span className="text-sm text-[#daa520]">Selecionar</span>
                  </button>
                ))}
              </div>
            )}
            {jogoSelecionado && (
              <div className="mt-3 flex items-center gap-3 rounded-lg border border-[#c09318] bg-black/40 p-3">
                {jogoSelecionado.capa_url && <img src={jogoSelecionado.capa_url} alt={`Capa de ${jogoSelecionado.nome}`} className="h-20 w-14 rounded object-cover" />}
                <div>
                  <p className="text-xs text-gray-400">Jogo selecionado</p>
                  <p className="font-semibold">{jogoSelecionado.nome}</p>
                  <p className="text-xs text-gray-400">ID IGDB: {jogoSelecionado.igdb_id}</p>
                </div>
              </div>
            )}
            {erros.jogo && (
              <div className="text-red-500 text-sm mt-1">{erros.jogo}</div>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="maxJogadores"
              className="block text-sm text-gray-300 mb-2"
            >
              Máx. de jogadores:
            </label>
            <input
              type="number"
              min="1"
              id="maxJogadores"
              value={maxJogadores}
              onChange={(e) => setMaxJogadores(e.target.value)}
              className={`w-full p-3 bg-white/5 text-white text-sm rounded-md border outline-none placeholder:text-gray-400 backdrop-blur-sm ${erros.maxJogadores ? "border-red-500" : "border-white/10 focus:border-[#c09318] focus:ring-1 focus:ring-[#c09318]"}`}
            />
            {erros.maxJogadores && (
              <div className="text-red-500 text-sm mt-1">
                {erros.maxJogadores}
              </div>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="status"
              className="block text-sm text-gray-300 mb-2"
            >
              Status:
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-3 bg-white/5 text-white text-sm rounded-md border border-white/10 outline-none backdrop-blur-sm focus:border-[#c09318] focus:ring-1 focus:ring-[#c09318]"
            >
              <option value="aberta">Aberta</option>
              <option value="fechada">Fechada</option>
              <option value="encerrada">Encerrada</option>
            </select>
          </div>

          <div className="mb-2">
            <button
              type="submit"
              id="cadastrar"
              className="w-full bg-[#81700e] hover:bg-[#978e0f] text-white rounded-md py-3 text-sm transition"
            >
              Cadastrar
            </button>
          </div>

          {mensagem && (
            <div className="text-green-400 mt-3 text-sm">{mensagem}</div>
          )}
          {erros.geral && (
            <div className="text-red-500 mt-3 text-sm">{erros.geral}</div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CadastrarSessao;
