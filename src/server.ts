import "dotenv/config";

import { auth } from "@/lib/auth/client";
import { env } from "@/lib/config/env";
import { UnauthorizedError } from "@/lib/errors";
import { errorHandler } from "@/lib/middleware/error-handler";
import { loggerHandler } from "@/lib/middleware/logger-handler";
import { notFoundHandler } from "@/lib/middleware/not-found-handler";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { contextStorage } from "hono/context-storage";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";

const app = new Hono();

app.use(
  cors({
    origin: env.CORS_ORIGINS,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    maxAge: 86400,
  }),
);
app.use(secureHeaders());
app.use(contextStorage());
app.use(requestId());
app.use(loggerHandler);

app.onError(errorHandler);
app.notFound(notFoundHandler);

// Better Auth universal handler
app.on(["GET", "POST"], "/api/auth/*", async (c) => {
  const response = await auth.handler(c.req.raw);
  return response;
});

// Protected test endpoint - returns current authenticated user
app.get("/api/me", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    throw new UnauthorizedError("No active session found");
  }

  return c.json({
    user: session.user,
    session: {
      id: session.session.id,
      expiresAt: session.session.expiresAt,
    },
  });
});

// Initialize server
serve({ fetch: app.fetch, port: env.PORT }, () => {
  console.log(`Server running on port ${env.PORT}`);
});
