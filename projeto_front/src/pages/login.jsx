import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  sendEmailVerification,
  signInWithEmailAndPassword,
} from "firebase/auth";
import LightPillar from "../components/LightPillar/LightPillar.jsx";
import axiosClient from "../utils/axios-client";
import { useAuthContext } from "../context/AuthProvider";
import { auth } from "../firebase";

const Login = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [erro, setErro] = useState("");
  const [modalVerificacaoAberto, setModalVerificacaoAberto] = useState(false);
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthContext();

  const handleLogin = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    if (modalVerificacaoAberto) {
      return;
    }

    setErro("");

    if (!email.trim() || !senha.trim()) {
      setErro("Email e senha são obrigatórios.");
      return;
    }

    try {
      const res = await axiosClient.post("/auth/login", {
        email,
        password: senha,
      });
      const { token, user } = res.data;
      if (!token) {
        throw new Error("Credenciais inválidas.");
      }
      setUser(user);
      setToken(token);
      setTimeout(() => navigate("/home"), 100);
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao fazer login. Verifique credenciais.";

      if (
        msg.toLowerCase().includes("verificado") ||
        error?.response?.status === 403
      ) {
        setModalVerificacaoAberto(true);
        return;
      }

      setErro(msg);
    }
  };

  const reenviarVerificacao = async () => {
    if (!email.trim() || !senha.trim()) {
      setErro("Informe e-mail e senha para reenviar a confirmação.");
      return;
    }

    try {
      const credenciais = await signInWithEmailAndPassword(auth, email, senha);
      await sendEmailVerification(credenciais.user);
      setErro(
        "E-mail de confirmação reenviado. Verifique sua caixa de entrada.",
      );
    } catch (error) {
      const msg =
        error?.message || "Não foi possível reenviar o e-mail de verificação.";
      setErro(msg);
    }
  };

  const confirmarEmailFirebase = async () => {
    if (!email.trim() || !senha.trim()) {
      setErro("Informe e-mail e senha para confirmar o acesso.");
      return;
    }

    try {
      const credenciais = await signInWithEmailAndPassword(auth, email, senha);
      await credenciais.user.reload();

      if (!credenciais.user.emailVerified) {
        setErro("Seu e-mail ainda não foi confirmado no Firebase.");
        return;
      }

      const firebaseToken = await credenciais.user.getIdToken(true);
      const res = await axiosClient.post("/auth/login/firebase", {
        firebase_token: firebaseToken,
      });

      const { token, user } = res.data;
      setModalVerificacaoAberto(false);
      setUser(user);
      setToken(token);
      setTimeout(() => navigate("/home"), 100);
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Não foi possível confirmar o e-mail agora.";
      setErro(msg);
    }
  };

  const handleCadastro = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    navigate("/cadastro");
  };

  const handleRecuperarSenha = () => {
    navigate("/recuperar-senha");
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black">
      {/* Background */}
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

      {/* Login Box */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-black/40 p-8 backdrop-blur-md shadow-2xl">
        <h1 className="mb-2 text-center text-3xl font-bold text-white">
          PlayOn
        </h1>

        <h2 className="mb-6 text-center text-gray-300">Login</h2>

        <div className="flex flex-col gap-4">
          <label htmlFor="email" className="text-sm text-gray-300">
            E-mail
          </label>

          <input
            type="text"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                handleLogin(e);
              }
            }}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
          />

          <label htmlFor="senha" className="text-sm text-gray-300">
            Senha
          </label>

          <div className="relative">
            <input
              type={senhaVisivel ? "text" : "password"}
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                  handleLogin(e);
                }
              }}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 pr-12 text-white outline-none transition focus:border-yellow-400"
            />
            <button
              type="button"
              aria-label={senhaVisivel ? "Ocultar senha" : "Mostrar senha"}
              title={senhaVisivel ? "Ocultar senha" : "Mostrar senha"}
              onClick={() => setSenhaVisivel((visivel) => !visivel)}
              className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-gray-400 transition hover:text-yellow-400"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                {senhaVisivel ? (
                  <>
                    <path d="M3 3l18 18" />
                    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                    <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5 0 8.5 4 9.8 6a17.8 17.8 0 0 1-3.1 3.4M6.2 6.2C3.9 7.6 2.6 10 2.2 10.8 3.5 13 7 17 12 17c1 0 2-.2 2.8-.5" />
                  </>
                ) : (
                  <>
                    <path d="M2.2 12C3.5 9 7 5 12 5s8.5 4 9.8 7c-1.3 3-4.8 7-9.8 7s-8.5-4-9.8-7Z" />
                    <circle cx="12" cy="12" r="2.5" />
                  </>
                )}
              </svg>
            </button>
          </div>

          {erro && <p className="text-sm text-red-400">{erro}</p>}

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleLogin(e);
            }}
            className="mt-4 rounded-lg bg-yellow-600 py-3 font-semibold text-white transition hover:bg-yellow-500"
          >
            Entrar
          </button>
        </div>

        <button
          type="button"
          onClick={handleCadastro}
          className="mt-4 w-full rounded-lg border border-white/10 py-3 text-gray-300 transition hover:bg-white/5"
        >
          Registre-se
        </button>

        <button
          type="button"
          onClick={handleRecuperarSenha}
          className="mt-3 w-full text-sm text-gray-300 transition hover:text-yellow-400"
        >
          Esqueci minha senha
        </button>
      </div>

      {modalVerificacaoAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
          onClick={() => setModalVerificacaoAberto(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-[#c09318]/40 bg-[#111111] p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-white">
              Confirme seu e-mail
            </h3>
            <p className="mt-2 text-sm text-gray-300">
              Seu e-mail ainda não foi confirmado. Use os botões abaixo para
              reenviar o e-mail ou continuar após validar.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  reenviarVerificacao();
                }}
                className="rounded-md border border-[#c09318] px-3 py-2 text-sm text-[#c09318]"
              >
                Reenviar e-mail de verificação
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  confirmarEmailFirebase();
                }}
                className="rounded-md bg-[#81700e] px-3 py-2 text-sm text-white"
              >
                Já confirmei o e-mail
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Login;
