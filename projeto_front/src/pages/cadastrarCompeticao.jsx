import { useState } from "react";
import { useNavigate } from "react-router";
import axiosClient from "../utils/axios-client";
import { useEffect } from "react";
import LightPillar from "../components/LightPillar/LightPillar.jsx";
import { useCompeticoes } from "../context/CompeticoesProvider";
import useSubmissionGuard from "../hooks/useSubmissionGuard.js";

const CadastrarCompeticao = () => {
  const dataHoje = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataEncerramento, setDataEncerramento] = useState("");
  const [tipo, setTipo] = useState("");
  const [inscricao, setInscricao] = useState("equipe");
  const [modo, setModo] = useState("personalizado");
  const [formato, setFormato] = useState("mata_mata_4");
  const [quantidadeParticipantes, setQuantidadeParticipantes] = useState("4");
  const [numeroRodadas, setNumeroRodadas] = useState("1");
  const [imagem, setImagem] = useState(null);
  const [erros, setErros] = useState({});
  const [mensagem, setMensagem] = useState("");
  const [imagemPreview, setImagemPreview] = useState(null);

  const [buscaJogo, setBuscaJogo] = useState("");
  const [jogosEncontrados, setJogosEncontrados] = useState([]);
  const [jogoSelecionado, setJogoSelecionado] = useState(null);
  const [carregandoJogos, setCarregandoJogos] = useState(false);
  const [erroBuscaJogo, setErroBuscaJogo] = useState("");

  const navigate = useNavigate();
  const { loadCompeticoes } = useCompeticoes();
  const { isSubmitting, beginSubmission, releaseSubmission } =
    useSubmissionGuard();

  useEffect(() => {
    return () => {
      if (imagemPreview) {
        URL.revokeObjectURL(imagemPreview);
      }
    };
  }, [imagemPreview]);

  useEffect(() => {
  const termo = buscaJogo.trim();
  if (termo.length < 2 || jogoSelecionado) {
    setJogosEncontrados([]);
    setErroBuscaJogo("");
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
        setJogosEncontrados(
          Array.isArray(response.data) ? response.data : []
        );
      }
    } catch {
      if (!cancelado) {
        setJogosEncontrados([]);
        setErroBuscaJogo(
          "Não foi possível pesquisar jogos. Tente novamente."
        );
      }
    } finally {
      if (!cancelado) {
        setCarregandoJogos(false);
      }
    }
  }, 350);
  return () => {
    cancelado = true;
    clearTimeout(timer);
  };
}, [buscaJogo, jogoSelecionado]);

  const validarFormulario = () => {
    const novosErros = {};
    if (!nome.trim()) novosErros.nome = "O nome é obrigatório.";
    if (!descricao.trim()) novosErros.descricao = "A descrição é obrigatória.";
    if (!dataEncerramento) novosErros.data_encerramento = "A data de encerramento é obrigatória.";
    if (!tipo.trim()) novosErros.tipo = "O tipo é obrigatório.";
    if (!inscricao.trim())
      novosErros.inscricao = "O tipo de inscrição é obrigatório.";
    if (!jogoSelecionado) {
      novosErros.jogo = "Selecione um jogo do catálogo.";
    }
    return novosErros;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!beginSubmission()) return;

    setMensagem("");
    setErros({});

    const errosValidacao = validarFormulario();
    if (Object.keys(errosValidacao).length > 0) {
      setErros(errosValidacao);
      releaseSubmission();
      return;
    }

    try {
      const formData = new FormData();
      formData.append("nome", nome);
      formData.append("descricao", descricao);
      formData.append("data_encerramento", dataEncerramento);
      formData.append("modo", modo);
      formData.append(
        "igdb_id",
        String(jogoSelecionado.igdb_id)
      );
      formData.append("jogo_nome", jogoSelecionado.nome);
      if (jogoSelecionado.capa_url) {
        formData.append("jogo_capa_url", jogoSelecionado.capa_url);
      }
      formData.append("tipo", tipo === "publico" ? "1" : "0");
      formData.append("inscricao", inscricao === "equipe" ? "1" : "0");
      if (modo === "estruturado") {
        formData.append("formato", formato);
        if (formato === "pontos") {
          formData.append("quantidade_participantes", quantidadeParticipantes);
          formData.append("numero_rodadas", numeroRodadas);
        } else {
          formData.append("quantidade_participantes", formato.replace("mata_mata_", ""));
        }
      }
      if (imagem) formData.append("imagem", imagem);

      await axiosClient.post("/competicoes", formData);

      await loadCompeticoes();

      setMensagem("Cadastro realizado com sucesso!");
      setTimeout(() => navigate("/competicoes"), 800);
    } catch (error) {
      const validationErrors = error?.response?.data?.errors;
      const validationMessage =
        validationErrors && typeof validationErrors === "object"
          ? Object.values(validationErrors).flat().join(" ")
          : null;
      const msg =
        validationMessage ||
        error?.response?.data?.message ||
        "Erro ao cadastrar competição. Tente novamente.";
      setErros({ geral: msg });
      releaseSubmission();
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
          encType="multipart/form-data"
          className="flex flex-col"
        >
          <h1 className="text-center text-xl font-semibold mb-2">PlayOn</h1>
          <h3 className="text-center text-sm text-gray-300 mb-6">
            Criando sua Competição
          </h3>

          <div className="mb-4">
            <label htmlFor="nome" className="block text-sm text-gray-300 mb-2">
              Nome:
            </label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className={`w-full p-3 bg-white/5 text-white text-sm rounded-md border outline-none placeholder:text-gray-400 backdrop-blur-sm ${erros.nome ? "border-red-500" : "border-white/10 focus:border-[#c09318] focus:ring-1 focus:ring-[#c09318]"}`}
            />
            {erros.nome && (
              <div className="text-red-500 text-sm mt-1">{erros.nome}</div>
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
              className={`w-full min-h-28 rounded-md border bg-white/5 p-3 text-sm text-white outline-none backdrop-blur-sm placeholder:text-gray-400 ${erros.descricao ? "border-red-500" : "border-white/10 focus:border-[#c09318] focus:ring-1 focus:ring-[#c09318]"}`}
            />
            {erros.descricao && (
              <div className="text-red-500 text-sm mt-1">{erros.descricao}</div>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="data_encerramento" className="block text-sm text-gray-300 mb-2">
              Data de encerramento:
            </label>
            <input
              type="date"
              id="data_encerramento"
              value={dataEncerramento}
              min={dataHoje}
              onChange={(e) => setDataEncerramento(e.target.value)}
              className={`w-full p-3 bg-white/5 text-white text-sm rounded-md border outline-none ${erros.data_encerramento ? "border-red-500" : "border-white/10 focus:border-[#c09318]"}`}
            />
            {erros.data_encerramento && <div className="text-red-500 text-sm mt-1">{erros.data_encerramento}</div>}
          </div>

          {/* Campo de busca de jogo */}
          
<div className="mb-4">
  <label
    htmlFor="buscaJogo"
    className="block text-sm text-gray-300 mb-2"
  >
    Jogo da competição:
  </label>

  <input
    type="text"
    id="buscaJogo"
    value={buscaJogo}
    autoComplete="off"
    placeholder="Pesquise um jogo, ex.: Valorant"
    onChange={(e) => {
      setBuscaJogo(e.target.value);
      setJogoSelecionado(null);
    }}
    className={`w-full p-3 bg-white/5 text-white text-sm rounded-md border outline-none placeholder:text-gray-400 ${
      erros.jogo
        ? "border-red-500"
        : "border-white/10 focus:border-[#c09318] focus:ring-1 focus:ring-[#c09318]"
    }`}
  />

  {carregandoJogos && (
    <p className="mt-2 text-sm text-gray-300">
      Pesquisando jogos...
    </p>
  )}

  {erroBuscaJogo && (
    <p className="mt-2 text-sm text-red-400">
      {erroBuscaJogo}
    </p>
  )}

  {!carregandoJogos &&
    !erroBuscaJogo &&
    buscaJogo.trim().length >= 2 &&
    !jogoSelecionado &&
    jogosEncontrados.length === 0 && (
      <p className="mt-2 text-sm text-gray-400">
        Nenhum jogo encontrado.
      </p>
    )}

  {jogosEncontrados.length > 0 && !jogoSelecionado && (
    <div className="mt-2 max-h-80 overflow-y-auto rounded-lg border border-white/10 bg-black/90">
      {jogosEncontrados.map((jogo) => (
        <button
          key={jogo.igdb_id}
          type="button"
          onClick={() => {
            setJogoSelecionado(jogo);
            setBuscaJogo(jogo.nome);
            setJogosEncontrados([]);
            setErros((prev) => {
              const novos = { ...prev };
              delete novos.jogo;
              return novos;
            });
          }}
          className="flex w-full items-center gap-3 border-b border-white/10 p-3 text-left transition hover:bg-white/10"
        >
          {jogo.capa_url ? (
            <img
              src={jogo.capa_url}
              alt={`Capa de ${jogo.nome}`}
              className="h-20 w-14 rounded object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-20 w-14 items-center justify-center rounded bg-white/10">
              <span className="text-xs text-gray-400">
                Sem capa
              </span>
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="font-semibold text-white">
              {jogo.nome}
            </p>

            {jogo.plataformas?.length > 0 && (
              <p className="mt-1 text-xs text-gray-400">
                {jogo.plataformas.join(", ")}
              </p>
            )}
          </div>

          <span className="text-sm text-[#daa520]">
            Selecionar
          </span>
        </button>
      ))}
    </div>
  )}

  {jogoSelecionado && (
    <div className="mt-3 flex items-center gap-3 rounded-lg border border-[#c09318] bg-black/40 p-3">
      {jogoSelecionado.capa_url && (
        <img
          src={jogoSelecionado.capa_url}
          alt={`Capa de ${jogoSelecionado.nome}`}
          className="h-20 w-14 rounded object-cover"
        />
      )}

      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-400">
          Jogo selecionado
        </p>

        <p className="font-semibold text-white">
          {jogoSelecionado.nome}
        </p>

        <p className="text-xs text-gray-400">
          ID IGDB: {jogoSelecionado.igdb_id}
        </p>
      </div>

      <button
        type="button"
        onClick={() => {
          setJogoSelecionado(null);
          setBuscaJogo("");
        }}
        className="rounded border border-white/20 px-3 py-2 text-sm text-white hover:bg-white/10"
      >
        Trocar
      </button>
    </div>
  )}

  {erros.jogo && (
    <p className="mt-1 text-sm text-red-500">
      {erros.jogo}
    </p>
  )}
</div>


          {/* Campo de Tipo de Competição */}

          <div className="mb-4">
            <label htmlFor="tipo" className="block text-sm text-gray-300 mb-2">
              Tipo:
            </label>
            <select
              id="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className={`w-full p-3 bg-white/5 text-white text-sm rounded-md border outline-none backdrop-blur-sm ${erros.tipo ? "border-red-500" : "border-white/10 focus:border-[#c09318] focus:ring-1 focus:ring-[#c09318]"}`}
            >
              <option value="">Selecione...</option>
              <option value="publico">Público</option>
              <option value="privado">Privado</option>
            </select>
            {erros.tipo && (
              <div className="text-red-500 text-sm mt-1">{erros.tipo}</div>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="inscricao"
              className="block text-sm text-gray-300 mb-2"
            >
              Inscrição (equipe/pessoa):
            </label>
            <select
              id="inscricao"
              value={inscricao}
              onChange={(e) => setInscricao(e.target.value)}
              className={`w-full p-3 bg-white/5 text-white text-sm rounded-md border outline-none backdrop-blur-sm ${erros.inscricao ? "border-red-500" : "border-white/10 focus:border-[#c09318] focus:ring-1 focus:ring-[#c09318]"}`}
            >
              <option value="pessoa">Individual</option>
              <option value="equipe">Equipes</option>
            </select>
            {erros.inscricao && (
              <div className="text-red-500 text-sm mt-1">{erros.inscricao}</div>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="modo" className="mb-2 block text-sm text-gray-300">
              Modo de competição:
            </label>
            <select
              id="modo"
              value={modo}
              onChange={(event) => setModo(event.target.value)}
              className="w-full rounded-md border border-white/10 bg-white/5 p-3 text-sm text-white"
            >
              <option value="personalizado">Personalizado</option>
              <option value="estruturado">Estruturado</option>
            </select>
          </div>

          {modo === "estruturado" && (
            <div className="mb-4 rounded-lg border border-white/10 p-4">
              <label htmlFor="formato" className="mb-2 block text-sm text-gray-300">
                Formato:
              </label>
              <select
                id="formato"
                value={formato}
                onChange={(event) => {
                  setFormato(event.target.value);
                  if (event.target.value !== "pontos") {
                    setQuantidadeParticipantes(event.target.value.replace("mata_mata_", ""));
                  }
                }}
                className="mb-3 w-full rounded-md border border-white/10 bg-white/5 p-3 text-sm text-white"
              >
                <option value="mata_mata_4">Mata-mata — semifinais (4 participantes)</option>
                <option value="mata_mata_8">Mata-mata — quartas de final (8 participantes)</option>
                <option value="mata_mata_16">Mata-mata — oitavas de final (16 participantes)</option>
                <option value="pontos">Classificação por pontos</option>
              </select>
              {formato === "pontos" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-sm text-gray-300">
                    Número de participantes (1 a 20):
                    <input
                      type="number"
                      min="1"
                      max="20"
                      required
                      value={quantidadeParticipantes}
                      onChange={(event) => setQuantidadeParticipantes(event.target.value)}
                      className="mt-1 w-full rounded-md border border-white/10 bg-white/5 p-3 text-white"
                    />
                  </label>
                  <label className="text-sm text-gray-300">
                    Número de rodadas:
                    <input
                      type="number"
                      min="1"
                      max="2147483647"
                      required
                      value={numeroRodadas}
                      onChange={(event) => setNumeroRodadas(event.target.value)}
                      className="mt-1 w-full rounded-md border border-white/10 bg-white/5 p-3 text-white"
                    />
                  </label>
                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  A chave é criada pelo organizador quando todos os participantes exigidos estiverem aprovados. A ordem segue a data de inscrição e o ID.
                </p>
              )}
            </div>
          )}

          <div className="mb-4">
            <label
              htmlFor="imagem"
              className="block text-sm text-gray-300 mb-2"
            >
              Foto:
            </label>
            <input
              type="file"
              id="imagem"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                setImagem(file);
                if (file) setImagemPreview(URL.createObjectURL(file));
                else setImagemPreview(null);
              }}
              className="w-full p-2 bg-white/5 text-white text-sm rounded-md border border-white/10 backdrop-blur-sm"
            />

            {imagemPreview && (
              <div className="mt-3 overflow-hidden rounded-xl border border-[#c09318] shadow-lg">
                <img
                  src={imagemPreview}
                  alt="Pré-visualização"
                  className="aspect-[16/7] w-full object-cover"
                  onLoad={() => URL.revokeObjectURL(imagemPreview)}
                />
              </div>
            )}
          </div>

          <div className="mb-2">
            <button
              type="submit"
              id="cadastrar"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="w-full bg-[#81700e] hover:bg-[#978e0f] text-white rounded-md py-3 text-sm transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Cadastrando..." : "Cadastrar"}
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

export default CadastrarCompeticao;
