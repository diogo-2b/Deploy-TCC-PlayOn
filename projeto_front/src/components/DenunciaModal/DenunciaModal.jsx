import { useState } from "react";
import axiosClient from "../../utils/axios-client";

const DenunciaModal = ({ tipo, idDenunciado, onSuccess }) => {
  const [aberto, setAberto] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const fechar = () => {
    if (enviando) return;
    setAberto(false);
    setMensagem("");
    setErro("");
  };

  const enviar = async (event) => {
    event.preventDefault();
    const texto = mensagem.trim();

    if (!texto) {
      setErro("Descreva o motivo da denúncia.");
      return;
    }

    setEnviando(true);
    setErro("");
    try {
      await axiosClient.post("/denuncias", {
        tipo,
        id_denunciado: idDenunciado,
        mensagem: texto,
      });
      fechar();
      onSuccess?.("Denúncia registrada com sucesso.");
    } catch (error) {
      setErro(
        error?.response?.data?.message ||
          "A denúncia não pôde ser registrada.",
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label="Denunciar"
        title="Denunciar"
        onClick={() => {
          setErro("");
          setAberto(true);
        }}
        className="absolute right-4 top-4 rounded-md border border-red-400/70 px-3 py-2 text-red-300 transition hover:bg-red-500/10"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M5 21V4m0 0c4-3 8 3 14 0v10c-6 3-10-3-14 0" />
        </svg>
      </button>

      {aberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) fechar();
          }}
        >
          <form
            onSubmit={enviar}
            className="w-full max-w-md rounded-xl border border-white/10 bg-[#141414] p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-denuncia"
          >
            <h2 id="titulo-denuncia" className="mb-4 text-xl font-semibold">
              Denunciar
            </h2>
            <label
              htmlFor="motivo-denuncia"
              className="mb-2 block text-sm text-gray-300"
            >
              Motivo da denúncia
            </label>
            <textarea
              id="motivo-denuncia"
              value={mensagem}
              onChange={(event) => setMensagem(event.target.value)}
              maxLength={1000}
              rows={5}
              placeholder="Descreva o motivo da denúncia"
              className="mb-2 w-full resize-y rounded-md border border-white/10 bg-white/5 p-3 text-white outline-none placeholder:text-gray-400 focus:border-[#c09318] focus:ring-1 focus:ring-[#c09318]"
              disabled={enviando}
              autoFocus
            />
            {erro && <p className="mb-3 text-sm text-red-300">{erro}</p>}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={fechar}
                disabled={enviando}
                className="rounded bg-white/10 px-4 py-2 text-gray-200 hover:bg-white/20 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={enviando}
                className="rounded bg-[#81700e] px-4 py-2 font-semibold disabled:opacity-50"
              >
                {enviando ? "Enviando..." : "Enviar denúncia"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default DenunciaModal;
