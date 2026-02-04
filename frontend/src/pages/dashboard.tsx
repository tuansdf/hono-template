import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signOut, useSession } from "@/lib/auth-client";
import { Loader2Icon, LogOutIcon, SettingsIcon, UserIcon } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: session } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate("/");
        },
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <Link to="/settings">
              <Button variant="ghost" size="icon">
                <SettingsIcon className="size-5" />
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              {isSigningOut ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <>
                  <LogOutIcon className="size-4" />
                  Sign out
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="size-5" />
                Welcome back
              </CardTitle>
              <CardDescription>
                You're signed in as {session?.user?.email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Name:</span>{" "}
                  {session?.user?.name}
                </p>
                <p>
                  <span className="text-muted-foreground">Email:</span>{" "}
                  {session?.user?.email}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session Info</CardTitle>
              <CardDescription>Your current session details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Session ID:</span>{" "}
                  <code className="rounded bg-muted px-1">
                    {session?.session?.id?.slice(0, 8)}...
                  </code>
                </p>
                <p>
                  <span className="text-muted-foreground">Created:</span>{" "}
                  {session?.session?.createdAt
                    ? new Date(session.session.createdAt).toLocaleDateString()
                    : "-"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
