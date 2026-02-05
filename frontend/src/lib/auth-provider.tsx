import { useSession } from "@/lib/auth-client";
import { createContext, useContext } from "react";

export interface AuthContextType {
  isAuthenticated: boolean;
  user: { id: string; name: string; email: string; role: string } | null;
  isPending: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();

  const auth: AuthContextType = {
    isAuthenticated: !!session?.user,
    user: session?.user
      ? {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          role: session.user.role ?? "user",
        }
      : null,
    isPending,
  };

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
