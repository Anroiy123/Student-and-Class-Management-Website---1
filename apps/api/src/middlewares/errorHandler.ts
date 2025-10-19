import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({
    message: "Endpoint not found",
  });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation error",
      errors: err.flatten(),
    });
  }

  console.error("Unhandled error", err);
  res.status(500).json({
    message: "Internal server error",
  });
};
