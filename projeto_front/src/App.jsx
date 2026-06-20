import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import UsuarioProvider from "./context/UsuarioProvider.jsx";
import SearchProvider from "./context/SearchProvider.jsx";
import EquipesProvider from "./context/EquipesProvider.jsx";
import CompeticoesProvider from "./context/CompeticoesProvider.jsx";
import SessoesProvider from "./context/SessoesProvider.jsx";
import Index from "./pages/index.jsx";
import Login from "./pages/login.jsx";
import CadastrarUsuario from "./pages/cadastrarUsuario.jsx";
import Home from "./pages/home.jsx";
import ListaEquipes from "./pages/listaEquipes.jsx";
import ListaCompeticao from "./pages/listaCompeticao.jsx";
import ListaSessoes from "./pages/listaSessoes.jsx";
import AlterarEquipe from "./pages/alterarEquipe.jsx";
import AlterarCompeticao from "./pages/alterarCompeticao.jsx";
import AlterarSessao from "./pages/alterarSessao.jsx";
import AlterarUsuario from "./pages/alterarUsuario.jsx";
import CadastrarEquipe from "./pages/cadastrarEquipe.jsx";
import CadastrarCompeticao from "./pages/cadastrarCompeticao.jsx";
import CadastrarSessao from "./pages/cadastrarSessao.jsx";
import { AuthProvider } from "./context/AuthProvider";
import PrivateRoute from "./config/PrivateRoute";

const App = () => {
  return (
    <UsuarioProvider>
      <SearchProvider>
        <SessoesProvider>
          <EquipesProvider>
            <CompeticoesProvider>
              <AuthProvider>
                <Router>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/cadastro" element={<CadastrarUsuario />} />

                    <Route
                      path="/home"
                      element={
                        <PrivateRoute>
                          <Home />
                        </PrivateRoute>
                      }
                    />

                    <Route
                      path="/equipes"
                      element={
                        <PrivateRoute>
                          <ListaEquipes />
                        </PrivateRoute>
                      }
                    />

                    <Route
                      path="/competicoes"
                      element={
                        <PrivateRoute>
                          <ListaCompeticao />
                        </PrivateRoute>
                      }
                    />

                    <Route
                      path="/sessoes"
                      element={
                        <PrivateRoute>
                          <ListaSessoes />
                        </PrivateRoute>
                      }
                    />

                    <Route
                      path="/equipe/:codigo"
                      element={
                        <PrivateRoute>
                          <AlterarEquipe />
                        </PrivateRoute>
                      }
                    />

                    <Route
                      path="/competicao/:codigo"
                      element={
                        <PrivateRoute>
                          <AlterarCompeticao />
                        </PrivateRoute>
                      }
                    />

                    <Route
                      path="/sessoes/:codigo"
                      element={
                        <PrivateRoute>
                          <AlterarSessao />
                        </PrivateRoute>
                      }
                    />

                    <Route
                      path="/perfil"
                      element={
                        <PrivateRoute>
                          <AlterarUsuario />
                        </PrivateRoute>
                      }
                    />

                    <Route
                      path="/equipes/cadastrar"
                      element={
                        <PrivateRoute>
                          <CadastrarEquipe />
                        </PrivateRoute>
                      }
                    />

                    <Route
                      path="/competicoes/cadastrar"
                      element={
                        <PrivateRoute>
                          <CadastrarCompeticao />
                        </PrivateRoute>
                      }
                    />

                    <Route
                      path="/sessoes/cadastrar"
                      element={
                        <PrivateRoute>
                          <CadastrarSessao />
                        </PrivateRoute>
                      }
                    />

                    <Route
                      path="/dashboard"
                      element={
                        <PrivateRoute>
                          {/* <ProdutosDashboard /> */}
                        </PrivateRoute>
                      }
                    />
                  </Routes>
                </Router>
              </AuthProvider>
            </CompeticoesProvider>
          </EquipesProvider>
        </SessoesProvider>
      </SearchProvider>
    </UsuarioProvider>
  );
};

export default App;
