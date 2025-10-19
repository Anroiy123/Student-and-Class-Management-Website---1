import jwt from "jsonwebtoken";
import { env } from "../config/env";

export type JwtPayload = {
  sub: string;
  role: string;
};

const ACCESS_TOKEN_EXPIRES_IN = "2h";

export const signAccessToken = (payload: JwtPayload) => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};
