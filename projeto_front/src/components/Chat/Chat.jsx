import { useEffect, useMemo, useRef, useState } from "react";
import { signInWithCustomToken } from "firebase/auth";
import {
  collection,
  doc,
  limitToLast,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import axiosClient from "../../utils/axios-client";
import { auth, db } from "../../firebase";

const MAX_MESSAGE_LENGTH = 500;
const CHAT_EMOJIS = ["😀", "😂", "😍", "😎", "👏", "🔥", "🎉", "🏆", "👍", "❤️"];

const formatTimestamp = (timestamp) => {
  if (!timestamp?.toDate) return "Enviando...";
  return timestamp.toDate().toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

const Chat = ({ type, entityId, user, className = "" }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const messagesContainerRef = useRef(null);

  const collectionName =
    type === "equipe"
      ? "chats_equipes"
      : type === "competicao"
        ? "chats_competicoes"
        : "chats_sessoes";
  const messageCollection = useMemo(
    () => collection(db, collectionName, String(entityId), "mensagens"),
    [collectionName, entityId],
  );

  useEffect(() => {
    let unsubscribe = () => {};
    let cancelled = false;

    const connect = async () => {
      setStatus("loading");
      setError("");
      setAuthorized(false);
      setMessages([]);

      try {
        const tokenResponse = await axiosClient.post("/auth/firebase-token");
        await signInWithCustomToken(auth, tokenResponse.data.token);
        const accessResponse = await axiosClient.get(
          `/chats/${type}/${entityId}/access`,
        );

        if (cancelled) return;
        if (!accessResponse.data.authorized) {
          setStatus("unauthorized");
          return;
        }

        setAuthorized(true);
        unsubscribe = onSnapshot(
          query(messageCollection, orderBy("timestamp", "asc"), limitToLast(100)),
          (snapshot) => {
            if (cancelled) return;
            setMessages(snapshot.docs.map((message) => message.data()));
            setStatus("ready");
          },
          (snapshotError) => {
            if (cancelled) return;
            console.error("Erro ao acompanhar mensagens do chat:", snapshotError);
            setError("Não foi possível carregar o chat.");
            setStatus("error");
          },
        );
      } catch (connectionError) {
        if (cancelled) return;
        console.error("Erro ao conectar ao chat:", connectionError);
        setError(
          connectionError?.response?.status === 403
            ? "Você não tem autorização para acessar este chat."
            : "Não foi possível conectar ao chat.",
        );
        setStatus(connectionError?.response?.status === 403 ? "unauthorized" : "error");
      }
    };

    connect();
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [entityId, messageCollection, type]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (event) => {
    event.preventDefault();
    const message = text.trim();
    if (!message || message.length > MAX_MESSAGE_LENGTH || !authorized) return;

    try {
      const messageReference = doc(messageCollection);
      await setDoc(messageReference, {
        uid: messageReference.id,
        id: String(entityId),
        id_usuario: String(user.id),
        mensagem: message,
        autor_nome: user.apelido || user.nome || `Usuário ${user.id}`,
        autor_imagem_url: user.imagem_url || user.foto_url || user.avatar_url || "",
        timestamp: serverTimestamp(),
      });
      setText("");
    } catch (sendError) {
      console.error("Erro ao enviar mensagem:", sendError);
      setError("Não foi possível enviar a mensagem.");
    }
  };

  if (status === "unauthorized") {
    return null;
  }

  return (
    <section
      className={`mt-6 rounded-md border border-white/10 bg-white/5 p-4 backdrop-blur-sm ${className}`}
    >
      <h2 className="mb-3 text-lg font-semibold text-[#c7c7c7]">Chat</h2>
      {status === "loading" && (
        <p className="text-sm text-gray-400">Conectando ao chat...</p>
      )}
      {status === "error" && <p className="text-sm text-red-300">{error}</p>}
      {status === "ready" && messages.length === 0 && (
        <p className="mb-3 text-sm text-gray-400">Nenhuma mensagem ainda.</p>
      )}
      {messages.length > 0 && (
        <div
          ref={messagesContainerRef}
          className="chat-messages mb-3 max-h-[32rem] space-y-2 overflow-y-auto pr-1"
        >
          {messages.map((message) => (
            <article
              key={message.uid}
              className="flex gap-2 rounded border border-white/10 bg-black/30 p-2"
            >
              <img
                src={message.autor_imagem_url || "/imagens/foto.png"}
                alt=""
                aria-hidden="true"
                className="h-9 w-9 shrink-0 rounded-full border border-[#c09318] object-cover"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = "/imagens/foto.png";
                }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-2 text-xs text-gray-400">
                  <strong className="truncate text-[#c09318]">
                    {message.autor_nome}
                  </strong>
                  <time className="shrink-0">
                    {formatTimestamp(message.timestamp)}
                  </time>
                </div>
                <p className="mt-1 break-words text-sm text-white">
                  {message.mensagem}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
      {authorized && (
        <form onSubmit={sendMessage} className="flex flex-col gap-2 sm:flex-row">
          <input
            value={text}
            maxLength={MAX_MESSAGE_LENGTH}
            onChange={(event) => setText(event.target.value)}
            placeholder="Escreva uma mensagem..."
            aria-label="Mensagem do chat"
            className="min-w-0 flex-1 rounded border border-white/10 bg-black/30 p-2 text-sm text-white outline-none focus:border-[#c09318]"
          />
          <div className="relative flex gap-2">
            <details className="group">
              <summary
                className="flex h-full cursor-pointer list-none items-center rounded bg-white/10 px-3 py-2 text-lg transition hover:bg-white/20"
                aria-label="Adicionar emoji"
                title="Adicionar emoji"
              >
                🙂
              </summary>
              <div className="absolute bottom-full right-0 z-10 mb-2 grid grid-cols-5 gap-1 rounded-md border border-white/10 bg-[#141414] p-2 shadow-xl">
                {CHAT_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setText((currentText) => `${currentText}${emoji}`)}
                    className="rounded p-1 text-lg transition hover:bg-white/20"
                    aria-label={`Adicionar ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </details>
          <button
            type="submit"
            disabled={!text.trim() || text.trim().length > MAX_MESSAGE_LENGTH}
            className="rounded bg-[#81700e] px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            Enviar
          </button>
          </div>
        </form>
      )}
      {text.length > MAX_MESSAGE_LENGTH - 50 && (
        <p className="mt-1 text-right text-xs text-gray-400">
          {text.length}/{MAX_MESSAGE_LENGTH}
        </p>
      )}
    </section>
  );
};

export default Chat;
