import { logger } from "@/lib/logger";
import type { MiddlewareHandler } from "hono";

export const loggerHandler: MiddlewareHandler = async (c, next) => {
  const start = performance.now();
  const path = c.req.path;
  const method = c.req.method;
  logger.info({
    event: "ENTER",
    method,
    path,
  });
  await next();
  logger.info({
    userId: c.var.authPayload?.sub,
    event: "EXIT",
    method,
    path,
    elapsedMs: performance.now() - start,
    status: c.res.status,
  });
};
