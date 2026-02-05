import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { signOut } from "@/lib/auth-client";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
  const { user, isPending, isAdmin } = useAuth();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <h1 className="text-3xl font-bold">Welcome</h1>
        <p className="text-muted-foreground">Please sign in to continue</p>
        <div className="flex gap-2">
          <Link to="/login" className={cn(buttonVariants())}>
            Sign In
          </Link>
          <Link to="/register" className={cn(buttonVariants({ variant: "outline" }))}>
            Register
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome, {user.name}!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Email:</span> {user.email}
            </p>
            <p>
              <span className="text-muted-foreground">Role:</span>{" "}
              {user.role ?? "user"}
            </p>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <Link
                to="/users"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Manage Users
              </Link>
            )}
            <Button
              variant="destructive"
              onClick={() => signOut()}
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
