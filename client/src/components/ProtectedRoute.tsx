import { Navigate, useLocation } from "react-router-dom";
import { useContext, ReactNode } from "react";
import { AuthContext } from "@/context/AuthContext";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user?.token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { user } = useContext(AuthContext);

  if (user?.token) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
