import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";

import axiosClient from "../utils/axios-client";

const mockNavigate = vi.fn();
const mockSetUser = vi.fn();
const mockSetToken = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: vi.fn(),
  sendEmailVerification: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  reload: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("../firebase", () => ({
  auth: {},
}));

vi.mock("../context/AuthProvider", () => ({
  useAuthContext: () => ({
    setUser: mockSetUser,
    setToken: mockSetToken,
  }),
}));

vi.mock("../utils/axios-client", () => ({
  default: {
    post: vi.fn(),
  },
}));

import CadastrarUsuario from "../pages/cadastrarUsuario.jsx";
import { MemoryRouter } from "react-router-dom";

describe("CadastrarUsuario", () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockReset();
    mockSetUser.mockReset();
    mockSetToken.mockReset();

    vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({
      user: {
        emailVerified: false,
      },
    });
    vi.mocked(sendEmailVerification).mockResolvedValue();
    vi.mocked(signOut).mockResolvedValue();
    vi.mocked(axiosClient.post).mockResolvedValue({
      data: {
        token: "token-teste",
        user: {
          id: 1,
          nome: "Novo Usuário",
          apelido: "novouser",
          email: "novo@teste.com",
        },
      },
    });
  });

  it("deve exibir erros de validação se campos estiverem vazios", async () => {
    render(
      <MemoryRouter>
        <CadastrarUsuario />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText("Cadastrar"));

    await waitFor(() => {
      expect(screen.getByText("O nome é obrigatório.")).toBeInTheDocument();
      expect(screen.getByText("O email é obrigatório.")).toBeInTheDocument();
      expect(screen.getByText("O apelido é obrigatório.")).toBeInTheDocument();
      expect(screen.getByText("A senha é obrigatória.")).toBeInTheDocument();
    });
  });

  it("deve solicitar a verificação de e-mail antes de finalizar", async () => {
    render(
      <MemoryRouter>
        <CadastrarUsuario />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/nome/i), {
      target: { value: "Novo Usuário" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "novo@teste.com" },
    });
    fireEvent.change(screen.getByLabelText(/apelido/i), {
      target: { value: "novouser" },
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: "senha123" },
    });

    fireEvent.click(screen.getByText("Cadastrar"));

    await waitFor(() => {
      expect(screen.getByText(/Verificação enviada/i)).toBeInTheDocument();
    });
  });
});
