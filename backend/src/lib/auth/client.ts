import { env, isDevelopment } from "@/lib/config/env";
import { db } from "@/lib/db/client";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";

export const auth = betterAuth({
  baseURL: env.BASE_URL,
  trustedOrigins: env.CORS_ORIGINS,
  cookieCache: {
    enabled: true,
    maxAge: 5 * 60,
    refreshCache: true,
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 10,
    storage: "memory",
  },
  logger: {
    disabled: !isDevelopment,
  },
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [admin()],
});
