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

const traduzirErroFirebase = (error) => {
  const mensagens = {
    "auth/expired-action-code": "Este código expirou. Solicite um novo e-mail.",
    "auth/invalid-action-code": "O código é inválido ou já foi utilizado.",
    "auth/user-disabled": "Esta conta está desativada.",
    "auth/user-not-found": "Nenhuma conta foi encontrada para este e-mail.",
    "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
    "auth/invalid-email": "O e-mail informado é inválido.",
  };

  return (
    mensagens[error?.code] ||
    error?.message ||
    "Não foi possível concluir a recuperação da senha."
  );
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
    const codigoRecebido = parametros.get("oobCode");
    const modo = parametros.get("mode");

    if (modo !== "resetPassword" || !codigoRecebido) {
      return;
    }

    setCodigo(codigoRecebido);
    setCarregando(true);
    verifyPasswordResetCode(auth, codigoRecebido)
      .then((emailRecuperacao) => {
        setEmail(emailRecuperacao);
        setEtapa("senha");
        setMensagem("Código confirmado. Crie sua nova senha.");
      })
      .catch((error) => {
        setErro(traduzirErroFirebase(error));
      })
      .finally(() => {
        setCarregando(false);
      });
  }, []);

  const limparMensagens = () => {
    setErro("");
    setMensagem("");
  };

  const enviarEmailRecuperacao = async (evento) => {
    evento.preventDefault();
    limparMensagens();

    if (!email.trim()) {
      setErro("Informe seu e-mail.");
      return;
    }

    try {
      setCarregando(true);
      await sendPasswordResetEmail(auth, email.trim(), {
        url: `${window.location.origin}/recuperar-senha`,
        handleCodeInApp: true,
      });
      setMensagem(
        "Enviamos um link de recuperação para seu e-mail. Abra o link para criar uma nova senha.",
      );
    } catch (error) {
      setErro(traduzirErroFirebase(error));
    } finally {
      setCarregando(false);
    }
  };

  const confirmarCodigo = async (evento) => {
    evento.preventDefault();
    limparMensagens();

    if (!codigo.trim()) {
      setErro("Cole o código recebido no link de recuperação.");
      return;
    }

    try {
      setCarregando(true);
      const emailRecuperacao = await verifyPasswordResetCode(
        auth,
        codigo.trim(),
      );
      setEmail(emailRecuperacao);
      setEtapa("senha");
      setMensagem("Código confirmado. Crie sua nova senha.");
    } catch (error) {
      setErro(traduzirErroFirebase(error));
    } finally {
      setCarregando(false);
    }
  };

  const atualizarSenha = async (evento) => {
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
      await confirmPasswordReset(auth, codigo.trim(), senha);
      const credenciais = await signInWithEmailAndPassword(auth, email, senha);
      const firebaseToken = await credenciais.user.getIdToken(true);
      await axiosClient.post("/auth/password/firebase", {
        firebase_token: firebaseToken,
        password: senha,
      });
      await signOut(auth).catch(() => {});
      setMensagem("Senha atualizada com sucesso. Você já pode fazer login.");
      setSenha("");
      setConfirmacaoSenha("");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      setErro(traduzirErroFirebase(error));
    } finally {
      setCarregando(false);
    }
  };

  const voltar = () => navigate("/login");

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

      <div className="relative z-10 mx-4 w-full max-w-md rounded-2xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-md">
        <button
          type="button"
          onClick={voltar}
          className="mb-4 border-2 border-[#c09318] px-3 py-2 rounded-md font-bold text-[#c09318]"
        >
          ← Voltar
        </button>

        <h1 className="mb-2 text-center text-3xl font-bold text-white">
          PlayOn
        </h1>
        <h2 className="mb-6 text-center text-gray-300">Recuperar senha</h2>

        {etapa === "email" && (
          <form onSubmit={enviarEmailRecuperacao} className="flex flex-col gap-4">
            <p className="text-sm text-gray-300">
              Informe seu e-mail cadastrado para receber o link de recuperação.
            </p>
            <label htmlFor="email" className="text-sm text-gray-300">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
              autoComplete="email"
              required
            />
            <button
              type="submit"
              disabled={carregando}
              className="mt-2 rounded-lg bg-yellow-600 py-3 font-semibold text-white transition hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {carregando ? "Enviando..." : "Enviar link de recuperação"}
            </button>
            <button
              type="button"
              onClick={() => {
                limparMensagens();
                setEtapa("codigo");
              }}
              className="text-sm text-gray-300 transition hover:text-yellow-400"
            >
              Já tenho um código
            </button>
          </form>
        )}

        {etapa === "codigo" && (
          <form onSubmit={confirmarCodigo} className="flex flex-col gap-4">
            <label htmlFor="codigo" className="text-sm text-gray-300">
              Código do link de recuperação
            </label>
            <input
              id="codigo"
              type="text"
              value={codigo}
              onChange={(evento) => setCodigo(evento.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
              required
            />
            <button
              type="submit"
              disabled={carregando}
              className="rounded-lg bg-yellow-600 py-3 font-semibold text-white transition hover:bg-yellow-500 disabled:opacity-60"
            >
              {carregando ? "Validando..." : "Validar código"}
            </button>
          </form>
        )}

        {etapa === "senha" && (
          <form onSubmit={atualizarSenha} className="flex flex-col gap-4">
            <p className="text-sm text-gray-300">
              Defina uma nova senha para a conta {email}.
            </p>
            <label htmlFor="senha" className="text-sm text-gray-300">
              Nova senha
            </label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(evento) => setSenha(evento.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
              autoComplete="new-password"
              minLength={6}
              required
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
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
              autoComplete="new-password"
              minLength={6}
              required
            />
            <button
              type="submit"
              disabled={carregando}
              className="rounded-lg bg-yellow-600 py-3 font-semibold text-white transition hover:bg-yellow-500 disabled:opacity-60"
            >
              {carregando ? "Atualizando..." : "Atualizar senha"}
            </button>
          </form>
        )}

        {mensagem && <p className="mt-4 text-sm text-green-400">{mensagem}</p>}
        {erro && <p className="mt-4 text-sm text-red-400">{erro}</p>}
      </div>
    </main>
  );
};

export default RecuperarSenha;
