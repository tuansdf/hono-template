import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { ApiResponse, PaginatedResponse, PaginationMeta } from "./types";

export function success<T>(c: Context, data: T, status: ContentfulStatusCode = 200): Response {
  const response: ApiResponse<T> = { data };
  return c.json(response, status);
}

export function successWithMeta<T>(
  c: Context,
  data: T,
  meta: Record<string, unknown>,
  status: ContentfulStatusCode = 200,
): Response {
  const response: ApiResponse<T> = { data, meta };
  return c.json(response, status);
}

export function created<T>(c: Context, data: T): Response {
  return success(c, data, 201);
}

export function paginated<T>(
  c: Context,
  data: T[],
  params: { page: number; limit: number; totalItems: number },
): Response {
  const totalPages = Math.ceil(params.totalItems / params.limit);
  const pagination: PaginationMeta = {
    page: params.page,
    limit: params.limit,
    totalItems: params.totalItems,
    totalPages,
    hasNextPage: params.page < totalPages,
    hasPreviousPage: params.page > 1,
  };

  const response: PaginatedResponse<T> = { data, pagination };
  return c.json(response, 200);
}

export function noContent(c: Context): Response {
  return c.body(null, 204);
}

export function message(c: Context, msg: string, status: ContentfulStatusCode = 200): Response {
  return c.json({ message: msg }, status);
}
