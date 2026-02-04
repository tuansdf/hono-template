import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signOut, useSession } from "@/lib/auth-client";
import { ArrowLeftIcon, Loader2Icon, LogOutIcon, UserIcon } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";

export function SettingsPage() {
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
        <div className="container mx-auto flex h-16 items-center gap-4 px-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeftIcon className="size-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl p-4">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="size-5" />
                Profile
              </CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-1">
                  <label className="text-sm text-muted-foreground">Name</label>
                  <p className="font-medium">{session?.user?.name}</p>
                </div>
                <div className="grid gap-1">
                  <label className="text-sm text-muted-foreground">Email</label>
                  <p className="font-medium">{session?.user?.email}</p>
                </div>
                <div className="grid gap-1">
                  <label className="text-sm text-muted-foreground">
                    User ID
                  </label>
                  <code className="rounded bg-muted px-2 py-1 text-sm">
                    {session?.user?.id}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription>
                Destructive actions for your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                {isSigningOut ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  <>
                    <LogOutIcon className="size-4" />
                    Sign out from all devices
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
