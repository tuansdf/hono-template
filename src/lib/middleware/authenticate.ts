import { auth } from "@/lib/auth/client";
import { UnauthorizedError } from "@/lib/errors";
import type { MiddlewareHandler } from "hono";

export const authenticate: MiddlewareHandler = async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    throw new UnauthorizedError("No active session found");
  }

  c.set("user", session.user);
  c.set("session", session.session);

  await next();
};
