import { useAuth } from "@/lib/auth-provider";
import { Navigate } from "react-router";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isPending } = useAuth();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
