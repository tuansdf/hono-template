import { env } from "@/lib/config/env";
import { db } from "@/lib/db/client";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
  baseURL: env.BASE_URL,
  trustedOrigins: env.CORS_ORIGINS,
  cookieCache: {
    enabled: true,
    maxAge: 5 * 60,
    refreshCache: true,
  },
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
});
