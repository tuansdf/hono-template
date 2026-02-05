import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth-provider";
import { RequireAdmin, RequireAuth } from "@/lib/route-guards";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";

// Page components
import AdminLayout from "@/routes/admin/layout";
import UsersPage from "@/routes/admin/users";
import HomePage from "@/routes/index";
import SignInPage from "@/routes/sign-in";
import SignUpPage from "@/routes/sign-up";

function RootLayout() {
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        {/* Public routes */}
        <Route index element={<HomePage />} />
        <Route path="sign-in" element={<SignInPage />} />
        <Route path="sign-up" element={<SignUpPage />} />

        {/* Protected admin routes */}
        <Route
          path="admin"
          element={
            <RequireAuth>
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            </RequireAuth>
          }
        >
          <Route path="users" element={<UsersPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export function RouterProvider() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
