import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser } from "@/services/LoginService";
import { useSnackbar } from "./SnackbarContext";

const AuthContext = createContext();
const AUTH_STORAGE_KEYS = ["token", "role", "roles", "userId", "username"];

function clearStoredAuth() {
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}

function toAuthState(user) {
  if (!user?.userId) {
    return null;
  }
  return {
    userId: user.userId,
    username: user.username,
    role: Array.isArray(user.roles) ? user.roles : user.role || [],
    passwordChangeRequired: Boolean(user.passwordChangeRequired),
  };
}

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [auth, setAuth] = useState(null);
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let active = true;
    clearStoredAuth();

    getCurrentUser()
      .then((user) => {
        if (!active) {
          return;
        }
        const next = toAuthState(user);
        setAuth(next);
        setStatus(next ? "authenticated" : "anonymous");
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setAuth(null);
        setStatus("anonymous");
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onAppLogout = () => {
      clearStoredAuth();
      setAuth(null);
      setStatus("anonymous");
      navigate("/", { replace: true });
      showSnackbar("Session expired! login again", "error");
    };

    window.addEventListener("app:logout", onAppLogout);
    return () => window.removeEventListener("app:logout", onAppLogout);
  }, [navigate]);

  const login = (user) => {
    clearStoredAuth();
    setAuth(toAuthState(user));
    setStatus("authenticated");
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // The cookie is cleared locally even when the request fails.
    } finally {
      clearStoredAuth();
      setAuth(null);
      setStatus("anonymous");
    }
  };

  return (
    <AuthContext.Provider value={{ auth, status, login, logout, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
