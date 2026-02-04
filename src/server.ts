import "dotenv/config";

import { auth } from "@/lib/auth/client";
import { env } from "@/lib/config/env";
import errorHandler from "@/lib/errors/error-handler";
import { UnauthorizedError } from "@/lib/errors/errors";
import fastifyCors from "@fastify/cors";
import Fastify from "fastify";

const fastify = Fastify({ logger: true });

// Register plugins
fastify.register(fastifyCors, {
  origin: env.CORS_ORIGINS,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  maxAge: 86400,
});

fastify.register(errorHandler);

// Helper to convert Fastify headers to Web Headers
function buildWebHeaders(
  headers: Record<string, string | string[] | undefined>
): Headers {
  const webHeaders = new Headers();
  Object.entries(headers).forEach(([key, value]) => {
    if (value) webHeaders.append(key, value.toString());
  });
  return webHeaders;
}

// Better Auth universal handler
fastify.route({
  method: ["GET", "POST"],
  url: "/api/auth/*",
  async handler(request, reply) {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const headers = buildWebHeaders(request.headers);

    const req = new Request(url.toString(), {
      method: request.method,
      headers,
      ...(request.body ? { body: JSON.stringify(request.body) } : {}),
    });

    const response = await auth.handler(req);

    reply.status(response.status);
    response.headers.forEach((value, key) => reply.header(key, value));
    reply.send(response.body ? await response.text() : null);
  },
});

// Protected test endpoint - returns current authenticated user
fastify.get("/api/me", async (request, reply) => {
  const headers = buildWebHeaders(request.headers);
  const session = await auth.api.getSession({ headers });

  if (!session) {
    throw new UnauthorizedError("No active session found");
  }

  return reply.send({
    user: session.user,
    session: {
      id: session.session.id,
      expiresAt: session.session.expiresAt,
    },
  });
});

// Initialize server
fastify.listen({ port: env.PORT }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Server running on port ${env.PORT}`);
});
