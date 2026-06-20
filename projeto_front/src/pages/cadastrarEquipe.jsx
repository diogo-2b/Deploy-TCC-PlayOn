import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import LightPillar from "../components/LightPillar/LightPillar.jsx";
import axiosClient from "../utils/axios-client";
import { useEquipes } from "../context/EquipesProvider";

const CadastrarEquipe = () => {
  const usuarioRaw = localStorage.getDecryptedItem("auth_user");
  const usuario = usuarioRaw ? JSON.parse(usuarioRaw) : {};

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [administrador] = useState(usuario.id || usuario.codigo || null);
  const [tipo, setTipo] = useState("");
  const [imagem, setImagem] = useState(null);
  const [imagemPreview, setImagemPreview] = useState(null);
  const [erros, setErros] = useState({});
  const [mensagem, setMensagem] = useState("");

  const navigate = useNavigate();
  const { loadEquipes } = useEquipes();

  useEffect(() => {
    return () => {
      if (imagemPreview) {
        try {
          URL.revokeObjectURL(imagemPreview);
        } catch {}
      }
    };
  }, [imagemPreview]);

  const validarFormulario = () => {
    const novosErros = {};
    if (!nome.trim()) novosErros.nome = "O nome é obrigatório.";
    if (!descricao.trim()) novosErros.descricao = "A descrição é obrigatória.";
    if (!tipo.trim()) novosErros.tipo = "O tipo é obrigatório.";
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
      const formData = new FormData();
      formData.append("nome", nome);
      formData.append("descricao", descricao);
      formData.append("administrador", administrador ?? "");
      if (tipo === "publico") formData.append("tipo", "1");
      if (imagem) formData.append("imagem", imagem);

      await axiosClient.post("/equipes", formData);

      // Atualiza o provider/local state para hot-reload nas listagens
      try {
        await loadEquipes();
      } catch (err) {
        // fallback silencioso
      }

      setMensagem("Cadastro realizado com sucesso!");
      setTimeout(() => navigate("/equipes"), 800);
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        "Erro ao cadastrar equipe. Tente novamente.";
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
          encType="multipart/form-data"
          className="flex flex-col"
        >
          <h1 className="text-center text-xl font-semibold mb-2">PlayOn</h1>
          <h3 className="text-center text-sm text-gray-300 mb-6">
            Criando sua Equipe
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
                if (file) {
                  const url = URL.createObjectURL(file);
                  setImagemPreview(url);
                } else {
                  setImagemPreview(null);
                }
              }}
              className="w-full p-2 bg-white/5 text-white text-sm rounded-md border border-white/10 backdrop-blur-sm"
            />

            {imagemPreview && (
              <div className="mt-3 flex justify-center">
                <img
                  src={imagemPreview}
                  alt="Pré-visualização"
                  className="h-32 w-32 rounded-2xl border border-[#c09318] object-cover shadow-lg"
                  onLoad={() => URL.revokeObjectURL(imagemPreview)}
                />
              </div>
            )}
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

export default CadastrarEquipe;
