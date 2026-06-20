import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import LightPillar from "../components/LightPillar/LightPillar.jsx";
import axiosClient from "../utils/axios-client";
import { auth } from "../firebase";
import { useAuthContext } from "../context/AuthProvider";

const CadastrarUsuario = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [apelido, setApelido] = useState("");
  const [senha, setSenha] = useState("");
  const [imagem, setImagem] = useState(null);
  const [imagemPreview, setImagemPreview] = useState(null);
  const [erros, setErros] = useState({});
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [modalVerificacaoAberto, setModalVerificacaoAberto] = useState(false);

  const navigate = useNavigate();
  const { setToken, setUser } = useAuthContext();

  const atualizarCampo = (setter) => (evento) => {
    setter(evento.target.value);
  };

  const validarFormulario = () => {
    const novosErros = {};
    if (!nome.trim()) novosErros.nome = "O nome é obrigatório.";
    if (!email.trim()) novosErros.email = "O email é obrigatório.";
    if (!apelido.trim()) novosErros.apelido = "O apelido é obrigatório.";
    if (!senha.trim()) novosErros.senha = "A senha é obrigatória.";
    return novosErros;
  };

  const traduzirErroFirebase = (error) => {
    const codigo = error?.code;

    if (codigo === "auth/email-already-in-use") {
      return "Esse e-mail já possui cadastro no Firebase.";
    }

    if (codigo === "auth/invalid-email") {
      return "O e-mail informado é inválido.";
    }

    if (codigo === "auth/weak-password") {
      return "A senha precisa ter pelo menos 6 caracteres.";
    }

    if (codigo === "auth/operation-not-allowed") {
      return "O método de autenticação do Firebase não está habilitado no projeto. Ative o provedor de e-mail no console do Firebase.";
    }

    if (codigo === "auth/user-not-found") {
      return "Nenhuma conta Firebase foi encontrada para esse e-mail.";
    }

    if (codigo === "auth/wrong-password") {
      return "A senha informada não confere com a conta Firebase.";
    }

    return error?.message || "Erro ao processar o cadastro Firebase.";
  };

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
      geral: error?.response?.data?.message || traduzirErroFirebase(error),
    };
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
      setCarregando(true);
      await cadastrarUsuario();
    } catch (error) {
      setErros(extrairErrosResposta(error));
    } finally {
      setCarregando(false);
    }
  };

  const cadastrarUsuario = async () => {
    const firebaseUser = await createUserWithEmailAndPassword(
      auth,
      email,
      senha,
    );

    await sendEmailVerification(firebaseUser.user);

    const firebaseToken = await firebaseUser.user.getIdToken(true);
    const formData = new FormData();
    formData.append("nome", nome);
    formData.append("apelido", apelido);
    formData.append("password", senha);
    formData.append("firebase_token", firebaseToken);

    if (imagem) {
      formData.append("imagem", imagem);
    }

    await axiosClient.post("/usuarios/firebase", formData);
    await signOut(auth).catch(() => {});

    setModalVerificacaoAberto(true);
    setMensagem("Conta criada. Verifique seu e-mail antes de fazer login.");
  };

  const reenviarConfirmacaoCadastro = async () => {
    try {
      setCarregando(true);
      const credenciais = await signInWithEmailAndPassword(auth, email, senha);
      await sendEmailVerification(credenciais.user);
      setErros({});
      setMensagem("E-mail de confirmação reenviado.");
    } catch (error) {
      const msg =
        error?.message || "Não foi possível reenviar o e-mail de verificação.";
      setErros({ geral: msg });
    } finally {
      setCarregando(false);
    }
  };

  const confirmarCadastro = async () => {
    try {
      setCarregando(true);
      setErros({});
      setMensagem("");

      const credenciais = await signInWithEmailAndPassword(auth, email, senha);
      await credenciais.user.reload();

      if (!credenciais.user.emailVerified) {
        setMensagem(
          "Seu e-mail ainda não foi confirmado. Abra o link enviado pelo Firebase.",
        );
        return;
      }

      setModalVerificacaoAberto(false);
      const firebaseToken = await credenciais.user.getIdToken(true);
      const res = await axiosClient.post("/auth/login/firebase", {
        firebase_token: firebaseToken,
      });

      setUser(res.data.user);
      setToken(res.data.token);
      await signOut(auth).catch(() => {});
      setTimeout(() => navigate("/home"), 300);
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Não foi possível concluir o cadastro depois da confirmação.";
      setErros({ geral: msg });
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    return () => {
      if (imagemPreview) {
        try {
          URL.revokeObjectURL(imagemPreview);
        } catch (error) {
          console.warn("Não foi possível liberar a URL da imagem.", error);
        }
      }
    };
  }, [imagemPreview]);

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
            Criando seu Cadastro
          </h3>

          <div className="mb-4">
            <label htmlFor="nome" className="block text-sm text-gray-300 mb-2">
              Nome: (Digite o nome completo)
            </label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={atualizarCampo(setNome)}
              className={`w-full p-3 bg-white/5 text-white text-sm rounded-md border outline-none placeholder:text-gray-400 backdrop-blur-sm ${erros.nome ? "border-red-500" : "border-white/10 focus:border-[#c09318] focus:ring-1 focus:ring-[#c09318]"}`}
            />
            {erros.nome && (
              <div className="text-red-500 text-sm mt-1">{erros.nome}</div>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm text-gray-300 mb-2">
              Email:
            </label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={atualizarCampo(setEmail)}
              className={`w-full p-3 bg-white/5 text-white text-sm rounded-md border outline-none placeholder:text-gray-400 backdrop-blur-sm ${erros.email ? "border-red-500" : "border-white/10 focus:border-[#c09318] focus:ring-1 focus:ring-[#c09318]"}`}
            />
            {erros.email && (
              <div className="text-red-500 text-sm mt-1">{erros.email}</div>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="apelido"
              className="block text-sm text-gray-300 mb-2"
            >
              Apelido:
            </label>
            <input
              type="text"
              id="apelido"
              value={apelido}
              onChange={atualizarCampo(setApelido)}
              className={`w-full p-3 bg-white/5 text-white text-sm rounded-md border outline-none placeholder:text-gray-400 backdrop-blur-sm ${erros.apelido ? "border-red-500" : "border-white/10 focus:border-[#c09318] focus:ring-1 focus:ring-[#c09318]"}`}
            />
            {erros.apelido && (
              <div className="text-red-500 text-sm mt-1">{erros.apelido}</div>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="senha" className="block text-sm text-gray-300 mb-2">
              Senha:
            </label>
            <input
              type="password"
              id="senha"
              value={senha}
              onChange={atualizarCampo(setSenha)}
              className={`w-full p-3 bg-white/5 text-white text-sm rounded-md border outline-none placeholder:text-gray-400 backdrop-blur-sm ${erros.senha ? "border-red-500" : "border-white/10 focus:border-[#c09318] focus:ring-1 focus:ring-[#c09318]"}`}
            />
            {erros.senha && (
              <div className="text-red-500 text-sm mt-1">{erros.senha}</div>
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
                if (file) setImagemPreview(URL.createObjectURL(file));
                else setImagemPreview(null);
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
              disabled={carregando}
              className="w-full bg-[#81700e] hover:bg-[#978e0f] disabled:cursor-not-allowed disabled:opacity-60 text-white rounded-md py-3 text-sm transition"
            >
              {carregando ? "Processando..." : "Cadastrar"}
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

      {modalVerificacaoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-md rounded-2xl border border-[#c09318]/40 bg-[#111111] p-6 text-center shadow-2xl">
            <h3 className="text-lg font-semibold text-white">
              Confirme seu e-mail
            </h3>
            <p className="mt-2 text-sm text-gray-300">
              Enviamos um e-mail para {email || "seu e-mail"}. Após confirmar,
              clique abaixo para continuar.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={reenviarConfirmacaoCadastro}
                disabled={carregando}
                className="rounded-md border border-[#c09318] px-3 py-2 text-sm text-[#c09318] disabled:opacity-60"
              >
                Reenviar e-mail de verificação
              </button>
              <button
                type="button"
                onClick={confirmarCadastro}
                disabled={carregando}
                className="rounded-md bg-[#81700e] px-3 py-2 text-sm text-white disabled:opacity-60"
              >
                {carregando ? "Processando..." : "Já confirmei o e-mail"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CadastrarUsuario;
