/* eslint-disable react/prop-types */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from "react";
import { manipulateLocalStorage } from "../utils/encrypt-storage";

const AuthContext = createContext({
  user: null,
  token: null,
  setUser: () => {},
  setToken: () => {},
  logOut: () => {},
});

const AUTH_USER_KEY = "auth_user";
const AUTH_TOKEN_KEY = "auth_token";

const normalizeUser = (value) => {
  if (!value) return null;

  if (typeof value === "string") {
    try {
      return normalizeUser(JSON.parse(value));
    } catch {
      return value;
    }
  }

  if (value?.data && typeof value.data === "object")
    return normalizeUser(value.data);
  if (value?.user && typeof value.user === "object")
    return normalizeUser(value.user);

  return {
    ...value,
    imagem_url: value.imagem_url || value.foto_url || value.avatar_url || null,
  };
};

export const AuthProvider = ({ children }) => {
  manipulateLocalStorage();
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getDecryptedItem(AUTH_USER_KEY);
      return normalizeUser(stored);
    } catch (e) {
      console.error("Erro ao recuperar usuário do localStorage:", e);
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    try {
      return localStorage.getDecryptedItem(AUTH_TOKEN_KEY) || null;
    } catch (e) {
      console.error("Erro ao recuperar token do localStorage:", e);
      return null;
    }
  });

  const handleSetUser = (userData) => {
    const normalizedUser = normalizeUser(userData);

    if (normalizedUser) {
      localStorage.setEncryptedItem(
        AUTH_USER_KEY,
        JSON.stringify(normalizedUser),
      );
    } else {
      localStorage.removeEncryptedItem(AUTH_USER_KEY);
    }

    setUser(normalizedUser);
  };

  const handleSetToken = (tokenValue) => {
    if (tokenValue) {
      localStorage.setEncryptedItem(AUTH_TOKEN_KEY, tokenValue);
    } else {
      localStorage.removeEncryptedItem(AUTH_TOKEN_KEY);
    }
    setToken(tokenValue);
  };

  const logOut = () => {
    localStorage.removeEncryptedItem(AUTH_USER_KEY);
    localStorage.removeEncryptedItem(AUTH_TOKEN_KEY);
    setUser(null);
    setToken(null);
  };

  useEffect(() => {
    console.log("AuthProvider - Estado atual:", { user, token });
  }, [user, token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        setUser: handleSetUser,
        setToken: handleSetToken,
        logOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext deve ser usado dentro de AuthProvider");
  }
  return context;
};
