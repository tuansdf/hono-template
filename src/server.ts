import "dotenv/config";

import { auth } from "@/lib/auth/client";
import { env } from "@/lib/config/env";
import { errorHandler } from "@/lib/middleware/error-handler";
import { loggerHandler } from "@/lib/middleware/logger-handler";
import { notFoundHandler } from "@/lib/middleware/not-found-handler";
import { routes } from "@/router";
import { Hono } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import { bodyLimit } from "hono/body-limit";
import { contextStorage } from "hono/context-storage";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { timeout } from "hono/timeout";

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
app.use(timeout(30000));
app.use(bodyLimit({ maxSize: 5 * 1024 * 1024 }));
app.use(contextStorage());
app.use(requestId());
app.use(loggerHandler);

app.on(["GET", "POST"], "/api/auth/*", async (c) => {
  const response = await auth.handler(c.req.raw);
  return response;
});

app.use(
  rateLimiter({
    windowMs: 60 * 1000,
    limit: 100,
    keyGenerator: (c) => c.req.header("x-forwarded-for") ?? "",
  }),
);
app.route("/api", routes);

app.onError(errorHandler);
app.notFound(notFoundHandler);

const port = env.PORT;
console.log(`Server is running on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};
