import { env } from "@/lib/config/env";
import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: env.BACKEND_BASE_URL,
  plugins: [adminClient()],
});

export const { useSession, signIn, signUp, signOut } = authClient;
