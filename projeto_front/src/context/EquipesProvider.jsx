/* eslint-disable react/prop-types */
import { createContext, useContext, useState, useEffect } from 'react';
import axiosClient, { BASE_URL } from '../utils/axios-client';
import { mockedEquipes } from '../mocks/mockedEquipes';

export const EquipesContext = createContext({
  data: null,
  loading: true,
  loadEquipes: () => {},
  setData: () => {},
  adicionarEquipe: () => {},
  atualizarEquipe: () => {},
  deletarEquipe: () => {},
  obterEquipePorCodigo: () => {},
  obterEquipesPorAdministrador: () => {},
  filtrarEquipesPorTipo: () => {}
});

const EquipesProvider = ({ children }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadEquipes = async () => {
    try {
      const res = await axiosClient.get('/equipes');
      const items = Array.isArray(res.data) ? res.data : (res.data.data || []);

      const mapped = items.map((it) => ({
        codigo: it.codigo ?? it.id,
        id: it.id ?? it.codigo,
        nome: it.nome,
        descricao: it.descricao,
        imagem: it.imagem ?? null,
        imagem_url: it.imagem_url ?? (it.imagem ? `${(BASE_URL || '').replace(/\/api\/v\d+\/?$/i, '')}/storage/equipes/${it.imagem}` : null),
        administrador: it.administrador ?? it.administrador_id ?? null,
        tipo: typeof it.tipo === 'boolean' ? (it.tipo ? 'publico' : 'privado') : (it.tipo ? 'publico' : 'privado'),
        created_at: it.created_at,
        updated_at: it.updated_at,
      }));

      setData(mapped.length ? mapped : mockedEquipes);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar equipes:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEquipes();
  }, []);

  const adicionarEquipe = async (novaEquipe) => {
    try {
      if (!novaEquipe) throw new Error('Equipe não informada');
      
      const equipe = {
        codigo: Math.max(...(data?.map(e => e.codigo) || [0]), 0) + 1,
        ...novaEquipe,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setData([...data, equipe]);
      return equipe;
    } catch (error) {
      console.error('Erro ao adicionar equipe:', error);
      throw error;
    }
  };

  const atualizarEquipe = async (codigo, dadosAtualizados) => {
    try {
      if (!codigo || !dadosAtualizados) throw new Error('Código ou dados não informados');
      
      setData(data.map(e => 
        e.codigo === codigo 
          ? { ...e, ...dadosAtualizados, updated_at: new Date().toISOString() } 
          : e
      ));
    } catch (error) {
      console.error('Erro ao atualizar equipe:', error);
      throw error;
    }
  };

  const deletarEquipe = async (codigo) => {
    try {
      if (!codigo) throw new Error('Código não informado');
      
      setData(data.filter(e => e.codigo !== codigo));
    } catch (error) {
      console.error('Erro ao deletar equipe:', error);
      throw error;
    }
  };

  const obterEquipePorCodigo = (codigo) => {
    try {
      return data?.find(e => e.codigo === codigo);
    } catch (error) {
      console.error('Erro ao obter equipe:', error);
      return null;
    }
  };

  const obterEquipesPorAdministrador = (administrador) => {
    try {
      return data?.filter(e => e.administrador === administrador) || [];
    } catch (error) {
      console.error('Erro ao filtrar equipes:', error);
      return [];
    }
  };

  const filtrarEquipesPorTipo = (tipo) => {
    try {
      return data?.filter(e => e.tipo === tipo) || [];
    } catch (error) {
      console.error('Erro ao filtrar equipes:', error);
      return [];
    }
  };

  return (
    <EquipesContext.Provider
      value={{
        data,
        loading,
        loadEquipes,
        setData,
        adicionarEquipe,
        atualizarEquipe,
        deletarEquipe,
        obterEquipePorCodigo,
        obterEquipesPorAdministrador,
        filtrarEquipesPorTipo
      }}
    >
      {children}
    </EquipesContext.Provider>
  );
};

export const useEquipes = () => {
  const context = useContext(EquipesContext);
  if (!context) {
    throw new Error('useEquipes deve ser usado dentro de um EquipesProvider');
  }
  return context;
};

export default EquipesProvider;
