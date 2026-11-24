import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { signInWithCustomToken } from "firebase/auth";
import {
  collection,
  onSnapshot,
  query,
  setDoc,
} from "firebase/firestore";
import axiosClient from "../utils/axios-client";
import { auth, db } from "../firebase";
import Chat from "../components/Chat/Chat.jsx";

vi.mock("firebase/auth", () => ({
  signInWithCustomToken: vi.fn(),
}));

vi.mock("firebase/firestore", () => ({
  collection: vi.fn((database, ...path) => ({ database, path })),
  doc: vi.fn(() => ({ id: "mensagem-gerada" })),
  limitToLast: vi.fn((count) => ({ count })),
  onSnapshot: vi.fn(),
  orderBy: vi.fn((field, direction) => ({ field, direction })),
  query: vi.fn((collectionReference, ...constraints) => ({
    collectionReference,
    constraints,
  })),
  serverTimestamp: vi.fn(() => "timestamp-servidor"),
  setDoc: vi.fn(),
}));

vi.mock("../firebase", () => ({
  auth: {},
  db: {},
}));

vi.mock("../utils/axios-client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const cancelarInscricao = vi.fn();
const usuario = {
  id: 8,
  nome: "Nome do Jogador",
  apelido: "Jogador Oito",
  imagem_url: "https://exemplo.com/avatar.png",
};

function renderizarChat(type = "sessao") {
  return render(<Chat type={type} entityId={42} user={usuario} />);
}

async function aguardarConexao() {
  await waitFor(() => expect(onSnapshot).toHaveBeenCalledTimes(1));
}

describe("Chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axiosClient.post.mockResolvedValue({ data: { token: "token-firebase" } });
    axiosClient.get.mockResolvedValue({ data: { authorized: true } });
    signInWithCustomToken.mockResolvedValue({});
    onSnapshot.mockReturnValue(cancelarInscricao);
    setDoc.mockResolvedValue();
  });

  afterEach(() => {
    cleanup();
  });

  it.each([
    ["sessao", "chats_sessoes"],
    ["equipe", "chats_equipes"],
    ["competicao", "chats_competicoes"],
  ])("conecta ao chat do tipo %s na coleção correspondente", async (type, nomeColecao) => {
    renderizarChat(type);

    await aguardarConexao();

    expect(axiosClient.post).toHaveBeenCalledWith("/auth/firebase-token");
    expect(signInWithCustomToken).toHaveBeenCalledWith(auth, "token-firebase");
    expect(axiosClient.get).toHaveBeenCalledWith(`/chats/${type}/42/access`);
    expect(collection).toHaveBeenCalledWith(db, nomeColecao, "42", "mensagens");
    expect(query).toHaveBeenCalledWith(
      expect.objectContaining({ path: [nomeColecao, "42", "mensagens"] }),
      expect.objectContaining({ field: "timestamp", direction: "asc" }),
      expect.objectContaining({ count: 100 }),
    );
  });

  it("exibe as mensagens recebidas em tempo real", async () => {
    renderizarChat();
    await aguardarConexao();

    const mensagem = {
      uid: "mensagem-1",
      autor_nome: "Outro jogador",
      autor_imagem_url: "",
      mensagem: "Olá, pessoal!",
      timestamp: { toDate: () => new Date("2026-01-01T10:00:00") },
    };

    await act(async () => {
      onSnapshot.mock.calls[0][1]({ docs: [{ data: () => mensagem }] });
    });

    expect(await screen.findByText("Olá, pessoal!")).toBeInTheDocument();
    expect(screen.getByText("Outro jogador")).toBeInTheDocument();
  });

  it("envia a mensagem sem espaços extras e limpa o campo", async () => {
    renderizarChat();
    await aguardarConexao();

    const campo = screen.getByRole("textbox", { name: "Mensagem do chat" });
    fireEvent.change(campo, { target: { value: "  Vamos jogar!  " } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));

    await waitFor(() => expect(setDoc).toHaveBeenCalledTimes(1));
    expect(setDoc).toHaveBeenCalledWith(
      { id: "mensagem-gerada" },
      {
        uid: "mensagem-gerada",
        id: "42",
        id_usuario: "8",
        mensagem: "Vamos jogar!",
        autor_nome: "Jogador Oito",
        autor_imagem_url: "https://exemplo.com/avatar.png",
        timestamp: "timestamp-servidor",
      },
    );
    await waitFor(() => expect(campo).toHaveValue(""));
  });

  it("não mostra o chat quando a API nega a autorização", async () => {
    axiosClient.get.mockResolvedValue({ data: { authorized: false } });
    renderizarChat();

    await waitFor(() => {
      expect(screen.queryByRole("heading", { name: "Chat" })).not.toBeInTheDocument();
    });
    expect(onSnapshot).not.toHaveBeenCalled();
  });

  it("mostra um erro quando não consegue acompanhar as mensagens", async () => {
    const erro = new Error("Falha na assinatura");
    const registrarErro = vi.spyOn(console, "error").mockImplementation(() => {});
    renderizarChat();
    await aguardarConexao();

    await act(async () => {
      onSnapshot.mock.calls[0][2](erro);
    });

    expect(await screen.findByText("Não foi possível carregar o chat.")).toBeInTheDocument();
    expect(registrarErro).toHaveBeenCalledWith("Erro ao acompanhar mensagens do chat:", erro);
    registrarErro.mockRestore();
  });

  it("mostra um erro se o envio da mensagem falhar", async () => {
    const erro = new Error("Falha no envio");
    const registrarErro = vi.spyOn(console, "error").mockImplementation(() => {});
    setDoc.mockRejectedValue(erro);
    renderizarChat();
    await aguardarConexao();

    const campo = screen.getByRole("textbox", { name: "Mensagem do chat" });
    fireEvent.change(campo, { target: { value: "Mensagem que não foi enviada" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));

    expect(await screen.findByText("Não foi possível enviar a mensagem.")).toBeInTheDocument();
    expect(campo).toHaveValue("Mensagem que não foi enviada");
    expect(registrarErro).toHaveBeenCalledWith("Erro ao enviar mensagem:", erro);
    registrarErro.mockRestore();
  });
});
