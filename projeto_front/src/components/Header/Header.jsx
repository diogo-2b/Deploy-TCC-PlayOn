import "./header.css";
import { useNavigate } from "react-router";
import { useEffect, useRef, useState } from "react";
import { useAuthContext } from "../../context/AuthProvider";

const getProfileImageUrl = (usuario) => {
  const apiBaseUrl = (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_BASE_URL ||
    ""
  ).replace(/\/api\/v\d+\/?$/i, "");

  const normalizeUrl = (url) => {
    if (!url) return "/imagens/foto.png";

    if (/^https?:\/\//i.test(url)) {
      return url.replace(
        /^https?:\/\/localhost(?::\d+)?/i,
        apiBaseUrl || "http://localhost:8000",
      );
    }

    return `${apiBaseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  if (usuario?.imagem_url) return normalizeUrl(usuario.imagem_url);
  if (usuario?.foto_url) return normalizeUrl(usuario.foto_url);
  if (usuario?.avatar_url) return normalizeUrl(usuario.avatar_url);
  if (usuario?.imagem) {
    return `${apiBaseUrl}/storage/usuarios/${usuario.imagem}`;
  }

  return "/imagens/foto.png";
};

export const Header = () => {
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);
  const { user, logOut } = useAuthContext();
  const avatarUrl = getProfileImageUrl(user);

  const menuRef = useRef(null);
  const settingsButtonRef = useRef(null);

  const handleProfileClick = () => {
    navigate("/perfil");
  };

  const handleSettingsClick = () => {
    setMenuAberto((prev) => !prev);
  };

  const handleLogout = () => {
    try {
      logOut();
      setMenuAberto(false);
      navigate("/");
      window.location.reload();
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !settingsButtonRef.current.contains(event.target)
      ) {
        setMenuAberto(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header>
      <div className="header-container">
        <div className="profile-info">
          {/* Perfil */}
          <button
            className="alterarPerfil"
            type="button"
            id="botao_perfil"
            onClick={handleProfileClick}
            aria-label="Alterar perfil"
          >
            <img
              src={avatarUrl}
              alt="Foto de perfil"
              className="profile-pic"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = "/imagens/foto.png";
              }}
            />
          </button>

          {/* Configurações */}
          <button
            ref={settingsButtonRef}
            className="settings-button"
            title="Configurações"
            onClick={handleSettingsClick}
            aria-label="Configurações"
          >
            ⚙️
          </button>

          {/* MENU (modal/dropdown) */}
          {menuAberto && (
            <div className="side-menu" ref={menuRef}>
              <button onClick={() => navigate("/perfil")}>Minha Conta</button>
              <button onClick={() => navigate("/minha-conta")}>
                Alterar Tema
              </button>
              <button onClick={() => navigate("/ajuda")}>Ajuda</button>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>

        <h1 className="site-title">PlayOn</h1>
      </div>
    </header>
  );
};
