import { createContext, use, type ReactNode } from "react";
import { useSession, type authClient } from "./auth-client";

type Session = typeof authClient.$Infer.Session;

interface AuthContextValue {
  session: Session | null;
  user: Session["user"] | null;
  isPending: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();

  const value: AuthContextValue = {
    session: session ?? null,
    user: session?.user ?? null,
    isPending,
    isAdmin: session?.user?.role === "admin",
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const context = use(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
