/* eslint-disable react/prop-types */
import { createContext, useContext, useState, useEffect } from "react";
import axiosClient from "../utils/axios-client";

export const SessoesContext = createContext({
  data: [],
  loading: true,
  loadSessoes: () => {},
  setData: () => {},
  adicionarSessao: () => {},
  atualizarSessao: () => {},
  deletarSessao: () => {},
  obterSessaoPorId: () => {},
  obterSessoesPorCriador: () => {},
  filtrarSessoesPorJogo: () => {},
  filtrarSessoesPorStatus: () => {},
});

const SessoesProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSessoes = async () => {
    try {
      const res = await axiosClient.get("/sessoes");
      const items = Array.isArray(res.data) ? res.data : res.data.data || [];

      const mapped = items.map((it) => ({
        id: it.id,
        criador_id: it.criador_id,
        criador_nome: it.criador?.apelido || it.criador?.nome || null,
        titulo: it.titulo,
        descricao: it.descricao,
        jogo: it.jogo,
        max_jogadores: it.max_jogadores,
        status: it.status,
        status_label:
          it.status_label ||
          (it.status === "fechada"
            ? "Fechada"
            : it.status === "encerrada"
              ? "Encerrada"
              : "Aberta"),
        jogadores_count: it.jogadores_count ?? 0,
        lotacao: it.lotacao || `${it.jogadores_count ?? 0}/${it.max_jogadores}`,
        jogadores: it.jogadores || [],
        created_at: it.created_at,
        updated_at: it.updated_at,
      }));
      setData(mapped);
    } catch (error) {
      console.error("Erro ao carregar sessões:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessoes();
  }, []);

  const obterSessaoPorId = (id) => {
    return data?.find((sessao) => sessao.id === id);
  };

  const adicionarSessao = async (novaSessao) => {
    const res = await axiosClient.post("/sessoes", novaSessao);
    await loadSessoes();
    return res.data;
  };

  const atualizarSessao = async (id, dadosAtualizados) => {
    const res = await axiosClient.put(`/sessoes/${id}`, dadosAtualizados);
    await loadSessoes();
    return res.data;
  };

  const deletarSessao = async (id) => {
    const res = await axiosClient.delete(`/sessoes/${id}`);
    await loadSessoes();
    return res.data;
  };

  const obterSessoesPorCriador = (criadorId) => {
    return data?.filter((sessao) => sessao.criador_id === criadorId) || [];
  };

  const filtrarSessoesPorJogo = (jogo) => {
    return data?.filter((sessao) => sessao.jogo === jogo) || [];
  };

  const filtrarSessoesPorStatus = (status) => {
    return data?.filter((sessao) => sessao.status === status) || [];
  };

  return (
    <SessoesContext.Provider
      value={{
        data,
        loading,
        loadSessoes,
        setData,
        adicionarSessao,
        atualizarSessao,
        deletarSessao,
        obterSessaoPorId,
        obterSessoesPorCriador,
        filtrarSessoesPorJogo,
        filtrarSessoesPorStatus,
      }}
    >
      {children}
    </SessoesContext.Provider>
  );
};

export const useSessoes = () => {
  const context = useContext(SessoesContext);
  if (!context) {
    throw new Error("useSessoes deve ser usado dentro de um SessoesProvider");
  }
  return context;
};

export default SessoesProvider;
