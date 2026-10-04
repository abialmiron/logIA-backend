import { timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { env } from "../../config/env";
import { AppError } from "../../shared/app-error";

function mismaClave(recibida: string, esperada: string) {
  const a = Buffer.from(recibida);
  const b = Buffer.from(esperada);
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}

export function requireApiKey(req: Request, _res: Response, next: NextFunction) {
  const key = req.header("x-api-key");
  if (!key || !mismaClave(key, env.n8nApiKey)) {
    next(new AppError(401, "API key inválida"));
    return;
  }
  next();
}
