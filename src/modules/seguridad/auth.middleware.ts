import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { AppError } from "../../shared/app-error";
import { seguridadRepository } from "./seguridad.repository";

declare global {
  namespace Express {
    interface Request {
      usuarioId?: number;
    }
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.header("authorization");
    if (!header?.startsWith("Bearer ")) {
      throw new AppError(401, "Sesión inválida");
    }

    const payload = jwt.verify(header.slice("Bearer ".length), env.jwtSecret);
    if (typeof payload === "string" || typeof payload.sub !== "string") {
      throw new AppError(401, "Sesión inválida");
    }

    const usuarioId = Number(payload.sub);
    if (!Number.isInteger(usuarioId)) {
      throw new AppError(401, "Sesión inválida");
    }

    const usuario = await seguridadRepository.findActivoById(usuarioId);
    if (!usuario) {
      throw new AppError(401, "Sesión inválida");
    }

    req.usuarioId = usuario.id;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }
    next(new AppError(401, "Sesión inválida"));
  }
}

export function requireAcceso(accesoId: string) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (req.usuarioId === undefined) {
        throw new AppError(401, "Sesión inválida");
      }

      const permiso = await seguridadRepository.tieneAcceso(req.usuarioId, accesoId);
      if (!permiso) {
        throw new AppError(403, "No tenés permiso para esta acción");
      }

      next();
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
        return;
      }
      next(error);
    }
  };
}
