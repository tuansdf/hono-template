import { authenticate } from "@/lib/middleware/authenticate";
import { Hono } from "hono";

export const routes = new Hono();

routes.get("/health", async (c) => {
  return c.text("OK");
});

routes.get("/me", authenticate, async (c) => {
  return c.text("OK");
});
