import "dotenv/config";

import { auth } from "@/lib/auth/client";
import { env } from "@/lib/config/env";
import { errorHandler } from "@/lib/middleware/error-handler";
import { loggerHandler } from "@/lib/middleware/logger-handler";
import { notFoundHandler } from "@/lib/middleware/not-found-handler";
import { routes } from "@/router";
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

app.route("/api", routes);

app.onError(errorHandler);
app.notFound(notFoundHandler);

app.on(["GET", "POST"], "/api/auth/*", async (c) => {
  const response = await auth.handler(c.req.raw);
  return response;
});

const port = env.PORT;
console.log(`Server is running on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};
