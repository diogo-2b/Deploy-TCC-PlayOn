/* eslint-disable react/prop-types */
import { createContext, useContext, useState, useEffect } from 'react';
import axiosClient, { BASE_URL } from '../utils/axios-client';
import { mockedCompeticoes } from '../mocks/mockedCompeticoes';

export const CompeticoesContext = createContext({
  data: null,
  loading: true,
  loadCompeticoes: () => {},
  setData: () => {},
  adicionarCompeticao: () => {},
  atualizarCompeticao: () => {},
  deletarCompeticao: () => {},
  obterCompeticaoPorCodigo: () => {},
  obterCompeticoesPorDono: () => {},
  filtrarCompeticoesPorTipo: () => {},
  filtrarCompeticoesPorInscricao: () => {},
  filtrarCompeticoesPorTipoEInscricao: () => {}
});

const CompeticoesProvider = ({ children }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadCompeticoes = async () => {
    try {
      // Busca as competições na API
      const res = await axiosClient.get('/competicoes');
      const items = Array.isArray(res.data) ? res.data : (res.data.data || []);

      const mapped = items.map((it) => ({
        codigo: it.codigo ?? it.id,
        id: it.id ?? it.codigo,
        nome: it.nome,
        descricao: it.descricao,
        imagem: it.imagem ?? null,
        imagem_url: it.imagem_url ?? (it.imagem ? `${(BASE_URL || '').replace(/\/api\/v\d+\/?$/i, '')}/storage/competicoes/${it.imagem}` : null),
        dono: it.dono ?? null,
        tipo: typeof it.tipo === 'boolean' ? (it.tipo ? 'publico' : 'privado') : (it.tipo ? 'publico' : 'privado'),
        inscricao: typeof it.inscricao === 'boolean' ? (it.inscricao ? 'equipe' : 'pessoa') : it.inscricao,
        created_at: it.created_at,
        updated_at: it.updated_at,
      }));

      setData(mapped.length ? mapped : mockedCompeticoes);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar competições:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompeticoes();
  }, []);

  const adicionarCompeticao = async (novaCompeticao) => {
    try {
      if (!novaCompeticao) throw new Error('Competição não informada');
      
      const competicao = {
        codigo: Math.max(...(data?.map(c => c.codigo) || [0]), 0) + 1,
        ...novaCompeticao,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setData([...data, competicao]);
      return competicao;
    } catch (error) {
      console.error('Erro ao adicionar competição:', error);
      throw error;
    }
  };

  const atualizarCompeticao = async (codigo, dadosAtualizados) => {
    try {
      if (!codigo || !dadosAtualizados) throw new Error('Código ou dados não informados');
      
      setData(data.map(c => 
        c.codigo === codigo 
          ? { ...c, ...dadosAtualizados, updated_at: new Date().toISOString() } 
          : c
      ));
    } catch (error) {
      console.error('Erro ao atualizar competição:', error);
      throw error;
    }
  };

  const deletarCompeticao = async (codigo) => {
    try {
      if (!codigo) throw new Error('Código não informado');
      
      setData(data.filter(c => c.codigo !== codigo));
    } catch (error) {
      console.error('Erro ao deletar competição:', error);
      throw error;
    }
  };

  const obterCompeticaoPorCodigo = (codigo) => {
    try {
      return data?.find(c => c.codigo === codigo);
    } catch (error) {
      console.error('Erro ao obter competição:', error);
      return null;
    }
  };

  const obterCompeticoesPorDono = (dono) => {
    try {
      return data?.filter(c => c.dono === dono) || [];
    } catch (error) {
      console.error('Erro ao filtrar competições:', error);
      return [];
    }
  };

  const filtrarCompeticoesPorTipo = (tipo) => {
    try {
      return data?.filter(c => c.tipo === tipo) || [];
    } catch (error) {
      console.error('Erro ao filtrar competições:', error);
      return [];
    }
  };

  const filtrarCompeticoesPorInscricao = (inscricao) => {
    try {
      return data?.filter(c => c.inscricao === inscricao) || [];
    } catch (error) {
      console.error('Erro ao filtrar competições:', error);
      return [];
    }
  };

  const filtrarCompeticoesPorTipoEInscricao = (tipo, inscricao) => {
    try {
      return data?.filter(c => c.tipo === tipo && c.inscricao === inscricao) || [];
    } catch (error) {
      console.error('Erro ao filtrar competições:', error);
      return [];
    }
  };

  return (
    <CompeticoesContext.Provider
      value={{
        data,
        loading,
        loadCompeticoes,
        setData,
        adicionarCompeticao,
        atualizarCompeticao,
        deletarCompeticao,
        obterCompeticaoPorCodigo,
        obterCompeticoesPorDono,
        filtrarCompeticoesPorTipo,
        filtrarCompeticoesPorInscricao,
        filtrarCompeticoesPorTipoEInscricao
      }}
    >
      {children}
    </CompeticoesContext.Provider>
  );
};

export const useCompeticoes = () => {
  const context = useContext(CompeticoesContext);
  if (!context) {
    throw new Error('useCompeticoes deve ser usado dentro de um CompeticoesProvider');
  }
  return context;
};

export default CompeticoesProvider;
