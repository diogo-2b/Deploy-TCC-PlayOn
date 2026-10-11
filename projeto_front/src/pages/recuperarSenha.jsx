import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  confirmPasswordReset,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  verifyPasswordResetCode,
} from "firebase/auth";
import LightPillar from "../components/LightPillar/LightPillar.jsx";
import axiosClient from "../utils/axios-client";
import { auth } from "../firebase";

const traduzirErro = (error) => {
  const mensagens = {
    "auth/expired-action-code":
      "O código expirou. Solicite um novo código de recuperação.",
    "auth/invalid-action-code":
      "O código informado é inválido ou já foi utilizado.",
    "auth/invalid-email": "O e-mail informado é inválido.",
    "auth/user-disabled": "Esta conta está desativada.",
    "auth/user-not-found": "Nenhuma conta foi encontrada para este e-mail.",
    "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
  };

  return (
    mensagens[error?.code] ||
    error?.response?.data?.message ||
    error?.message ||
    "Não foi possível concluir a recuperação da senha."
  );
};

const extrairCodigo = (valor) => {
  const valorInformado = valor.trim();

  if (!valorInformado) {
    return "";
  }

  try {
    const url = new URL(valorInformado);
    return url.searchParams.get("oobCode") || valorInformado;
  } catch {
    return valorInformado;
  }
};

const RecuperarSenha = () => {
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");
  const [etapa, setEtapa] = useState("email");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const parametros = new URLSearchParams(window.location.search);
    const codigoDoFirebase = parametros.get("oobCode");
    const modo = parametros.get("mode");

    if (modo !== "resetPassword" || !codigoDoFirebase) {
      return;
    }

    const validarLinkRecebido = async () => {
      try {
        setCarregando(true);
        const emailDaConta = await verifyPasswordResetCode(
          auth,
          codigoDoFirebase,
        );
        setCodigo(codigoDoFirebase);
        setEmail(emailDaConta);
        setEtapa("senha");
        setMensagem("E-mail confirmado. Informe sua nova senha.");
      } catch (error) {
        setErro(traduzirErro(error));
      } finally {
        setCarregando(false);
      }
    };

    validarLinkRecebido();
  }, []);

  const limparMensagens = () => {
    setMensagem("");
    setErro("");
  };

  const enviarCodigo = async (evento) => {
    evento.preventDefault();
    limparMensagens();

    const emailInformado = email.trim();
    if (!emailInformado) {
      setErro("Informe o e-mail cadastrado.");
      return;
    }

    try {
      setCarregando(true);
      await sendPasswordResetEmail(auth, emailInformado, {
        url: `${window.location.origin}/recuperar-senha`,
        handleCodeInApp: true,
      });
      setEtapa("codigo");
      setMensagem(
        "Enviamos um e-mail com o código de recuperação. Cole aqui o código ou o link recebido.",
      );
    } catch (error) {
      setErro(traduzirErro(error));
    } finally {
      setCarregando(false);
    }
  };

  const validarCodigo = async (evento) => {
    evento.preventDefault();
    limparMensagens();

    const codigoExtraido = extrairCodigo(codigo);
    if (!codigoExtraido) {
      setErro("Informe o código recebido no e-mail.");
      return;
    }

    try {
      setCarregando(true);
      const emailDaConta = await verifyPasswordResetCode(auth, codigoExtraido);
      setCodigo(codigoExtraido);
      setEmail(emailDaConta);
      setEtapa("senha");
      setMensagem("Código confirmado. Informe sua nova senha.");
    } catch (error) {
      setErro(traduzirErro(error));
    } finally {
      setCarregando(false);
    }
  };

  const salvarNovaSenha = async (evento) => {
    evento.preventDefault();
    limparMensagens();

    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (senha !== confirmacaoSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    try {
      setCarregando(true);

      await confirmPasswordReset(auth, codigo, senha);

      const credenciais = await signInWithEmailAndPassword(auth, email, senha);
      const firebaseToken = await credenciais.user.getIdToken(true);

      await axiosClient.post("/auth/password/firebase", {
        firebase_token: firebaseToken,
        password: senha,
      });

      await signOut(auth).catch(() => {});
      setSenha("");
      setConfirmacaoSenha("");
      setMensagem("Senha atualizada com sucesso. Você já pode fazer login.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      setErro(traduzirErro(error));
    } finally {
      setCarregando(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black">
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

      <section className="relative z-10 mx-4 w-full max-w-md rounded-2xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-md">
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="mb-4 rounded-md border-2 border-[#c09318] px-3 py-2 font-bold text-[#c09318]"
        >
          ← Voltar
        </button>

        <h1 className="mb-2 text-center text-3xl font-bold text-white">
          PlayOn
        </h1>
        <h2 className="mb-6 text-center text-gray-300">Recuperar senha</h2>

        {etapa === "email" && (
          <form onSubmit={enviarCodigo} className="flex flex-col gap-4">
            <p className="text-sm text-gray-300">
              Informe seu e-mail cadastrado para receber o código de
              recuperação.
            </p>
            <label htmlFor="email" className="text-sm text-gray-300">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
              autoComplete="email"
              required
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
            />
            <button
              type="submit"
              disabled={carregando}
              className="rounded-lg bg-yellow-600 py-3 font-semibold text-white transition hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {carregando ? "Enviando..." : "Enviar código"}
            </button>
          </form>
        )}

        {etapa === "codigo" && (
          <form onSubmit={validarCodigo} className="flex flex-col gap-4">
            <p className="text-sm text-gray-300">
              Verifique sua caixa de entrada e cole abaixo o código do e-mail
              ou o link completo recebido.
            </p>
            <label htmlFor="codigo" className="text-sm text-gray-300">
              Código de recuperação
            </label>
            <input
              id="codigo"
              type="text"
              value={codigo}
              onChange={(evento) => setCodigo(evento.target.value)}
              autoComplete="one-time-code"
              required
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
            />
            <button
              type="submit"
              disabled={carregando}
              className="rounded-lg bg-yellow-600 py-3 font-semibold text-white transition hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {carregando ? "Validando..." : "Confirmar código"}
            </button>
            <button
              type="button"
              onClick={() => {
                limparMensagens();
                setEtapa("email");
              }}
              className="text-sm text-gray-300 transition hover:text-yellow-400"
            >
              Solicitar outro código
            </button>
          </form>
        )}

        {etapa === "senha" && (
          <form onSubmit={salvarNovaSenha} className="flex flex-col gap-4">
            <p className="text-sm text-gray-300">
              Crie uma nova senha para a conta {email}.
            </p>
            <label htmlFor="senha" className="text-sm text-gray-300">
              Nova senha
            </label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(evento) => setSenha(evento.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
            />
            <label
              htmlFor="confirmacaoSenha"
              className="text-sm text-gray-300"
            >
              Confirmar nova senha
            </label>
            <input
              id="confirmacaoSenha"
              type="password"
              value={confirmacaoSenha}
              onChange={(evento) => setConfirmacaoSenha(evento.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
            />
            <button
              type="submit"
              disabled={carregando}
              className="rounded-lg bg-yellow-600 py-3 font-semibold text-white transition hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {carregando ? "Salvando..." : "Salvar nova senha"}
            </button>
          </form>
        )}

        {mensagem && <p className="mt-4 text-sm text-green-400">{mensagem}</p>}
        {erro && <p className="mt-4 text-sm text-red-400">{erro}</p>}
      </section>
    </main>
  );
};

export default RecuperarSenha;
