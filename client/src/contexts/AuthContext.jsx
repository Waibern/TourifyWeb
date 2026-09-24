import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
const C = createContext();
export const useAuth = () => useContext(C);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = localStorage.getItem("tourify_token");
    if (!t) return setLoading(false);
    api
      .get("/auth/me")
      .then((r) => setUser(r.data))
      .catch(() => localStorage.removeItem("tourify_token"))
      .finally(() => setLoading(false));
  }, []);
  const auth = async (path, data) => {
    const r = await api.post(`/auth/${path}`, data);
    localStorage.setItem("tourify_token", r.data.token);
    setUser(r.data.user);
    return r.data.user;
  };
  const logout = () => {
    localStorage.removeItem("tourify_token");
    setUser(null);
  };
  return (
    <C.Provider
      value={{
        user,
        loading,
        login: (d) => auth("login", d),
        register: (d) => auth("register", d),
        logout,
      }}
    >
      {children}
    </C.Provider>
  );
}
