import { Button } from "@/components/ui/button";
import { signOut, useSession } from "@/lib/auth-client";
import { Loader2, LogOut, Shield } from "lucide-react";
import { Link } from "react-router";

export default function HomePage() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl shadow-xl p-8 space-y-6">
          {session?.user ? (
            <>
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">
                  Welcome, {session.user.name}
                </h1>
                <p className="text-muted-foreground text-sm">{session.user.email}</p>
              </div>

              <div className="space-y-3">
                {session.user.role === "admin" && (
                  <Link
                    to="/admin/users"
                    className="flex items-center justify-center gap-2 w-full h-10 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium text-sm"
                  >
                    <Shield className="size-4" />
                    Admin Dashboard
                  </Link>
                )}
                <Button variant="outline" className="w-full h-10 gap-2" onClick={handleSignOut}>
                  <LogOut className="size-4" />
                  Sign Out
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">Welcome</h1>
                <p className="text-muted-foreground text-sm">Sign in to access your account</p>
              </div>

              <div className="space-y-3">
                <Link
                  to="/sign-in"
                  className="flex items-center justify-center w-full h-10 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium text-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/sign-up"
                  className="flex items-center justify-center w-full h-10 rounded-md border border-border bg-background hover:bg-muted transition-colors font-medium text-sm"
                >
                  Create Account
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
