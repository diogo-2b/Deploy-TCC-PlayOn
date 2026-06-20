import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import LightPillar from "../components/LightPillar/LightPillar.jsx";
import axiosClient from "../utils/axios-client";
import { useAuthContext } from "../context/AuthProvider";

const AlterarUsuario = () => {
  const [usuario, setUsuario] = useState(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [apelido, setApelido] = useState("");
  const [senha, setSenha] = useState("");
  const [imagem, setImagem] = useState(null);
  const [imagemPreview, setImagemPreview] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [erros, setErros] = useState({});
  const navigate = useNavigate();
  const { setUser } = useAuthContext();

  const avatarUrl =
    imagemPreview ||
    usuario?.imagem_url ||
    usuario?.foto_url ||
    usuario?.avatar_url ||
    (usuario?.imagem
      ? `${(import.meta.env.VITE_API_URL || import.meta.env.VITE_BASE_URL || "").replace(/\/api\/v\d+\/?$/i, "")}/storage/usuarios/${usuario.imagem}`
      : "/imagens/foto.png");

  useEffect(() => {
    const fetch = async () => {
      const usuarioArmazenado = localStorage.getDecryptedItem("auth_user");
      if (usuarioArmazenado) {
        const parsed = JSON.parse(usuarioArmazenado);
        setUsuario(parsed);
        setNome(parsed.nome || "");
        setEmail(parsed.email || "");
        setApelido(parsed.apelido || "");
      } else {
        setUsuario(null);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    return () => {
      if (imagemPreview) {
        try {
          URL.revokeObjectURL(imagemPreview);
        } catch (error) {
          console.error("Erro ao liberar URL da imagem:", error);
        }
      }
    };
  }, [imagemPreview]);

  if (!usuario) return <p>Usuário não encontrado.</p>;

  const extrairErrosResposta = (error) => {
    const errosResposta = error?.response?.data?.errors;

    if (errosResposta && typeof errosResposta === "object") {
      return Object.fromEntries(
        Object.entries(errosResposta).map(([campo, valor]) => [
          campo,
          Array.isArray(valor) ? valor[0] : valor,
        ]),
      );
    }

    return {
      geral: error?.response?.data?.message || "Erro ao atualizar",
    };
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setErros({});
    setMensagem("");

    try {
      const formData = new FormData();
      formData.append("nome", nome);
      formData.append("email", email);
      formData.append("apelido", apelido);
      if (senha) formData.append("password", senha);
      if (imagem) formData.append("imagem", imagem);

      formData.append("_method", "PUT");

      const res = await axiosClient.post(
        `/usuarios/${usuario.id || usuario.codigo || usuario.codigoUsuario}`,
        formData,
      );

      let updatedUser = res.data;
      if (updatedUser?.data) updatedUser = updatedUser.data;
      if (updatedUser?.user) updatedUser = updatedUser.user;

      if (typeof updatedUser === "string") {
        updatedUser = JSON.parse(updatedUser);
      }

      try {
        localStorage.setEncryptedItem("auth_user", JSON.stringify(updatedUser));
      } catch (error) {
        console.error("Erro ao salvar usuário no storage:", error);
      }
      try {
        setUser(updatedUser);
      } catch (error) {
        console.error("Erro ao atualizar contexto do usuário:", error);
      }

      setNome(updatedUser.nome || nome);
      setEmail(updatedUser.email || email);
      setApelido(updatedUser.apelido || apelido);

      setMensagem("Atualizado com sucesso");
      setTimeout(() => navigate("/"), 800);
      window.location.reload();
    } catch (error) {
      setErros(extrairErrosResposta(error));
      setMensagem("");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Deseja realmente deletar seu perfil?")) return;
    try {
      await axiosClient.delete(
        `/usuarios/${usuario.id || usuario.codigo || usuario.codigoUsuario}`,
      );
      localStorage.removeEncryptedItem("auth_user");
      localStorage.removeEncryptedItem("auth_token");
      setTimeout(() => navigate("/"), 800);
      window.location.reload();
    } catch (error) {
      setMensagem(error?.response?.data?.message || "Erro ao deletar");
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
          className="mb-4 inline-block border-2 border-[#c09318] text-[#c09318] px-3 py-2 rounded-md font-bold"
        >
          ← Voltar
        </button>

        <form
          onSubmit={handleUpdate}
          encType="multipart/form-data"
          className="flex flex-col"
        >
          <div className="mb-4 flex flex-col items-center">
            <img
              src={avatarUrl}
              alt="Foto do usuário"
              className="h-45 w-45 rounded-full border border-[#c09318] object-cover shadow-lg"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = "/imagens/foto.png";
              }}
            />
            <p className="text-sm text-gray-300">
              {nome || apelido || "Seu perfil"}
            </p>
          </div>

          <label className="text-sm text-gray-400">Nome:</label>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="mb-3 rounded-md border border-white/10 bg-white/5 p-3 text-sm text-white outline-none backdrop-blur-sm placeholder:text-gray-400 focus:border-[#c09318] focus:ring-1 focus:ring-[#c09318]"
          />

          <label className="text-sm text-gray-400">Email:</label>
          <input
            value={email}
            readOnly
            disabled
            className="mb-3 rounded-md border border-white/10 bg-white/5 p-3 text-sm text-gray-400 outline-none cursor-not-allowed backdrop-blur-sm"
          />

          <label className="text-sm text-gray-400">Apelido:</label>
          <input
            value={apelido}
            onChange={(e) => setApelido(e.target.value)}
            className={`mb-1 rounded-md border bg-white/5 p-3 text-sm text-white outline-none backdrop-blur-sm placeholder:text-gray-400 ${erros.apelido ? "border-red-500" : "border-white/10 focus:border-[#c09318] focus:ring-1 focus:ring-[#c09318]"}`}
          />
          {erros.apelido && (
            <div className="mb-3 text-sm text-red-500">{erros.apelido}</div>
          )}

          <label className="text-sm text-gray-400">Senha:</label>
          <input
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            type="password"
            className="mb-3 rounded-md border border-white/10 bg-white/5 p-3 text-sm text-white outline-none backdrop-blur-sm placeholder:text-gray-400 focus:border-[#c09318] focus:ring-1 focus:ring-[#c09318]"
          />

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

          {imagemPreview && (
            <img
              src={imagemPreview}
              alt="Pré-visualização"
              className="mt-3 h-28 w-28 rounded-full object-cover border border-[#c09318]"
              onLoad={() => URL.revokeObjectURL(imagemPreview)}
            />
          )}

          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-[#81700e] py-2 rounded">
              Salvar mudanças
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="flex-1 bg-red-600 py-2 rounded"
            >
              Deletar perfil
            </button>
          </div>

          {mensagem && (
            <div className="mt-3 text-sm text-green-300">{mensagem}</div>
          )}
          {erros.geral && (
            <div className="mt-3 text-sm text-red-500">{erros.geral}</div>
          )}
        </form>
      </section>
    </main>
  );
};

export default AlterarUsuario;
