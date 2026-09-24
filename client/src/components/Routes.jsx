import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
export function Protected({ children }) {
  const { user, loading } = useAuth();
  return loading ? null : user ? children : <Navigate to="/login" replace />;
}
export function Admin({ children }) {
  const { user, loading } = useAuth();
  return loading ? null : user?.role === "admin" ? (
    children
  ) : (
    <Navigate to="/" replace />
  );
}
