import type { ErrorHandler } from "hono";
import { ZodError } from "zod";
import { AppError, ValidationError } from "../errors";

interface ErrorResponse {
  error: string;
  message: string;
  code: string;
  details?: { field: string; message: string }[];
}

export const errorHandler: ErrorHandler = (error, c) => {
  const response: ErrorResponse = {
    error: "Internal Server Error",
    message: "An unexpected error occurred",
    code: "INTERNAL_ERROR",
  };

  let statusCode = 500;

  // Handle custom AppError instances
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    response.error = error.name.replace("Error", " Error").trim();
    response.message = error.message;
    response.code = error.code;

    if (error instanceof ValidationError) {
      response.details = error.details;
    }
  }
  // Handle Zod validation errors
  else if (error instanceof ZodError) {
    statusCode = 422;
    response.error = "Validation Error";
    response.message = "Invalid request data";
    response.code = "VALIDATION_ERROR";
    response.details = error.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
  }
  // Generic Error
  else if (error instanceof Error) {
    response.message = error.message;
  }

  // Log the error
  const logLevel = statusCode >= 500 ? "error" : "warn";
  console[logLevel](`[${statusCode}] ${response.message}`, error);

  return c.json(response, statusCode as 400);
};
