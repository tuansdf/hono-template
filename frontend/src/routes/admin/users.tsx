import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  banned: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isPending, setIsPending] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchUsers = async () => {
    setIsPending(true);
    const { data, error } = await authClient.admin.listUsers({
      query: {
        limit: pageSize,
        offset: (page - 1) * pageSize,
      },
    });
    if (error) {
      toast.error("Failed to load users");
    } else if (data) {
      setUsers(data.users as User[]);
    }
    setIsPending(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleRoleToggle = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    const { error } = await authClient.admin.setRole({ userId, role: newRole });
    if (error) {
      toast.error("Failed to update role");
    } else {
      toast.success(`Role updated to ${newRole}`);
      fetchUsers();
    }
  };

  const handleBanToggle = async (userId: string, isBanned: boolean) => {
    if (isBanned) {
      const { error } = await authClient.admin.unbanUser({ userId });
      if (error) {
        toast.error("Failed to unban user");
      } else {
        toast.success("User unbanned");
        fetchUsers();
      }
    } else {
      const { error } = await authClient.admin.banUser({ userId });
      if (error) {
        toast.error("Failed to ban user");
      } else {
        toast.success("User banned");
        fetchUsers();
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage user roles and access</p>
      </div>

      {isPending ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">User</th>
                  <th className="text-left p-4 font-medium">Role</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-border hover:bg-muted/30">
                    <td className="p-4">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </td>
                    <td className="p-4">
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="p-4">
                      {user.banned ? (
                        <Badge variant="destructive">Banned</Badge>
                      ) : (
                        <Badge variant="outline">Active</Badge>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRoleToggle(user.id, user.role)}
                      >
                        {user.role === "admin" ? "Remove Admin" : "Make Admin"}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleBanToggle(user.id, user.banned)}
                      >
                        {user.banned ? "Unban" : "Ban"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center">
            <Button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">Page {page}</span>
            <Button onClick={() => setPage((p) => p + 1)} disabled={users.length < pageSize}>
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
