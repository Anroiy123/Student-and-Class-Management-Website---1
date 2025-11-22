import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({
    message: 'Endpoint not found',
  });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation error',
      errors: err.flatten(),
    });
  }

  // Handle Mongo duplicate key error (e.g., unique indexes like mssv/email)
  const dupErr = err as { code?: number; keyValue?: Record<string, unknown> };
  if (dupErr.code === 11000) {
    const keyValue = dupErr.keyValue;
    const fields = keyValue ? Object.keys(keyValue) : [];
    const message = fields.length
      ? `Duplicate value for ${fields.join(', ')}`
      : 'Duplicate key error';
    return res.status(409).json({ message, fields: keyValue });
  }

  console.error('Unhandled error', err);
  res.status(500).json({
    message: 'Internal server error',
  });
};
