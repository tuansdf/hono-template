import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { ZodError } from "zod";
import { AppError, ValidationError } from "./errors";

interface ErrorResponse {
  error: string;
  message: string;
  code: string;
  details?: { field: string; message: string }[];
}

async function errorHandlerPlugin(fastify: FastifyInstance) {
  fastify.setErrorHandler(
    (error: FastifyError | Error, request: FastifyRequest, reply: FastifyReply) => {
      const response: ErrorResponse = {
        error: "Internal Server Error",
        message: "An unexpected error occurred",
        code: "INTERNAL_ERROR",
      };

      let statusCode = 500;
      let logLevel: "error" | "warn" = "error";

      // Handle custom AppError instances
      if (error instanceof AppError) {
        statusCode = error.statusCode;
        response.error = error.name.replace("Error", " Error").trim();
        response.message = error.message;
        response.code = error.code;

        if (error instanceof ValidationError) {
          response.details = error.details;
        }

        logLevel = statusCode >= 500 ? "error" : "warn";
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
        logLevel = "warn";
      }
      // Handle Fastify errors (validation, 404, etc.)
      else if ("statusCode" in error && typeof error.statusCode === "number") {
        statusCode = error.statusCode;
        response.error = error.name || "Error";
        response.message = error.message;
        response.code = (error as FastifyError).code || "FASTIFY_ERROR";
        logLevel = statusCode >= 500 ? "error" : "warn";
      }
      // Generic Error
      else if (error instanceof Error) {
        response.message = error.message;
      }

      // Log the error
      if (logLevel === "error") {
        request.log.error({ err: error, statusCode }, response.message);
      } else {
        request.log.warn({ err: error, statusCode }, response.message);
      }

      return reply.status(statusCode).send(response);
    }
  );
}

export default fp(errorHandlerPlugin, {
  name: "error-handler",
});
