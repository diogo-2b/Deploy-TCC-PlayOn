import { createContext, useContext, useState, useEffect } from 'react';
import { mockedUsuarios } from '../mocks/mockedUsuarios';

export const UsuarioContext = createContext({
  data: null,
  usuarioLogado: null,
  loading: true,
  loadUsuarios: () => {},
  setData: () => {},
  login: () => {},
  logout: () => {},
  adicionarUsuario: () => {},
  atualizarUsuario: () => {},
  deletarUsuario: () => {},
  obterUsuarioPorId: () => {}
});

const UsuarioProvider = ({ children }) => {
  const [data, setData] = useState(null);
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUsuarios = async () => {
    try {
      
      setData(mockedUsuarios);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsuarios();
  }, []);

  const login = (email, senha) => {
    try {
      const usuario = data?.find(u => u.email === email && u.senha === senha);
      if (usuario) {
        setUsuarioLogado(usuario);
        return usuario;
      }
      return null;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return null;
    }
  };

  const logout = () => {
    setUsuarioLogado(null);
  };

  const adicionarUsuario = async (novoUsuario) => {
    try {
      if (!novoUsuario) throw new Error('Usuário não informado');
      
      const usuario = {
        id: Math.max(...(data?.map(u => u.id) || [0]), 0) + 1,
        ...novoUsuario
      };
      
      setData([...data, usuario]);
      return usuario;
    } catch (error) {
      console.error('Erro ao adicionar usuário:', error);
      throw error;
    }
  };

  const atualizarUsuario = async (id, dadosAtualizados) => {
    try {
      if (!id || !dadosAtualizados) throw new Error('ID ou dados não informados');
      
      setData(data.map(u => u.id === id ? { ...u, ...dadosAtualizados } : u));
      
      
      if (usuarioLogado?.id === id) {
        setUsuarioLogado({ ...usuarioLogado, ...dadosAtualizados });
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  };

  const deletarUsuario = async (id) => {
    try {
      if (!id) throw new Error('ID não informado');
      
      setData(data.filter(u => u.id !== id));
      
      
      if (usuarioLogado?.id === id) {
        setUsuarioLogado(null);
      }
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      throw error;
    }
  };

  const obterUsuarioPorId = (id) => {
    try {
      return data?.find(u => u.id === id);
    } catch (error) {
      console.error('Erro ao obter usuário:', error);
      return null;
    }
  };

  return (
    <UsuarioContext.Provider
      value={{
        data,
        usuarioLogado,
        loading,
        loadUsuarios,
        setData,
        login,
        logout,
        adicionarUsuario,
        atualizarUsuario,
        deletarUsuario,
        obterUsuarioPorId
      }}
    >
      {children}
    </UsuarioContext.Provider>
  );
};

export const useUsuario = () => {
  const context = useContext(UsuarioContext);
  if (!context) {
    throw new Error('useUsuario deve ser usado dentro de um UsuarioProvider');
  }
  return context;
};

export default UsuarioProvider;
