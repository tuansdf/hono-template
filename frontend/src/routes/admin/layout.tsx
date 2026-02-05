import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";
import { Home, LogOut, Users } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router";

export default function AdminLayout() {
  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-card border-r border-border p-4 flex flex-col">
        <div className="font-semibold text-lg mb-6">Admin Dashboard</div>
        <nav className="flex flex-col gap-1 flex-1">
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted text-sm font-medium ${isActive ? "bg-muted" : ""}`
            }
          >
            <Users className="size-4" />
            Users
          </NavLink>
        </nav>
        <div className="border-t border-border pt-4 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted text-sm font-medium"
          >
            <Home className="size-4" />
            Back to Home
          </Link>
          <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleSignOut}>
            <LogOut className="size-4" />
            Sign Out
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
