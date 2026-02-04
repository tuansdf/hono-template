import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { Loader2Icon } from "lucide-react";
import { Link } from "react-router";

export function HomePage() {
  const { data: session, isPending } = useSession();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold">My App</h1>
          <nav className="flex items-center gap-4">
            {isPending ? (
              <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
            ) : session ? (
              <Link to="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/sign-in">
                  <Button variant="ghost">Sign in</Button>
                </Link>
                <Link to="/sign-up">
                  <Button>Get started</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <h2 className="text-4xl font-bold tracking-tight">
            Welcome to My App
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A simple authentication example with Better Auth
          </p>
          {!session && !isPending && (
            <div className="mt-8 flex justify-center gap-4">
              <Link to="/sign-up">
                <Button size="lg">Create an account</Button>
              </Link>
              <Link to="/sign-in">
                <Button variant="outline" size="lg">
                  Sign in
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
