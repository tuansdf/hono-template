/**
 * Custom Application Errors
 *
 * Throw these from route handlers - the centralized error handler
 * will catch them and return consistent JSON responses.
 */

import type { ContentfulStatusCode } from "hono/utils/http-status";

export class AppError extends Error {
  statusCode: ContentfulStatusCode;
  code: string;

  constructor(message: string, statusCode: ContentfulStatusCode, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request", code = "BAD_REQUEST") {
    super(message, 400, code);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", code = "AUTH_UNAUTHORIZED") {
    super(message, 401, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", code = "FORBIDDEN") {
    super(message, 403, code);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found", code = "NOT_FOUND") {
    super(message, 404, code);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict", code = "CONFLICT") {
    super(message, 409, code);
  }
}

export interface ValidationDetail {
  field: string;
  message: string;
}

export class ValidationError extends AppError {
  details: ValidationDetail[];

  constructor(
    details: ValidationDetail[],
    message = "Validation error",
    code = "VALIDATION_ERROR",
  ) {
    super(message, 422, code);
    this.details = details;
  }
}

export class InternalError extends AppError {
  constructor(message = "Internal server error", code = "INTERNAL_ERROR") {
    super(message, 500, code);
  }
}
