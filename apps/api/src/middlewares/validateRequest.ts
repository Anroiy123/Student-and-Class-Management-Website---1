import type { RequestHandler } from "express";
import type { AnyZodObject } from "zod";

export const validateRequest =
  (schema: AnyZodObject): RequestHandler =>
  (req, res, next) => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      next();
    } catch (error) {
      next(error);
    }
  };
