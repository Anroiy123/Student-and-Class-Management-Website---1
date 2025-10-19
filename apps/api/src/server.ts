import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { apiRouter } from "./routes";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";

export const createServer = () => {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_URL ?? "*",
      credentials: true,
    }),
  );
  app.use(helmet());
  app.use(express.json());
  app.use(morgan("dev"));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
