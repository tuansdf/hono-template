import { isDevelopment } from "@/lib/config/env";
import { logger } from "@/lib/logger";
import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { ZodError } from "zod";
import { AppError, ValidationError } from "../errors";

interface ErrorResponse {
  message: string;
  code?: string;
  details?: { field: string; message: string }[];
}

export const errorHandler: ErrorHandler = (error, c) => {
  const response: ErrorResponse = {
    message: "An unexpected error occurred",
    code: "INTERNAL_ERROR",
  };

  let statusCode: ContentfulStatusCode = 500;

  if (error instanceof HTTPException) {
    statusCode = error.status;
    response.message = error.message;
    response.code = undefined;
  } else if (error instanceof AppError) {
    statusCode = error.statusCode;
    response.message = error.message;
    response.code = error.code;

    if (error instanceof ValidationError) {
      response.details = error.details;
    }
  } else if (error instanceof ZodError) {
    statusCode = 422;
    response.message = "Invalid request data";
    response.code = "VALIDATION_ERROR";
    response.details = error.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
  } else if (error instanceof Error) {
    response.message = error.message;
  }

  if (isDevelopment) {
    logger.error({ error });
  } else if (statusCode < 500) {
    logger.error({ error: error.message });
  } else {
    logger.error({ error });
  }

  return c.json(response, statusCode);
};
