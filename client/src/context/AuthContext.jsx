import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  });
  const [appMode, setAppMode] = useState(() => localStorage.getItem("appMode") || "user");

  const login = (data) => {
    const u = data.user || data.admin;
    const t = data.token;
    setToken(t);
    setUser(u);
    localStorage.setItem("token", t);
    localStorage.setItem("user", JSON.stringify(u));
  };

  const loginAdmin = (data) => {
    login(data);
    setAppMode("admin");
    localStorage.setItem("appMode", "admin");
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setAppMode("user");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("appMode");
  };

  const switchToAdmin = () => {
    setAppMode("admin");
    localStorage.setItem("appMode", "admin");
  };

  const switchToUser = () => {
    setAppMode("user");
    localStorage.setItem("appMode", "user");
  };

  return (
    <AuthContext.Provider value={{ token, user, appMode, login, loginAdmin, logout, switchToAdmin, switchToUser }}>
      {children}
    </AuthContext.Provider>
  );
}