import type { NotFoundHandler } from "hono";

export const notFoundHandler: NotFoundHandler = () => {
  return Response.json({ message: "Not Found" }, { status: 404 });
};
