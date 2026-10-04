import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/async-handler";
import { AppError } from "../../shared/app-error";
import { loginSchema } from "./seguridad.schema";
import { seguridadService } from "./seguridad.service";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const body = loginSchema.parse(req.body);
  const sesion = await seguridadService.login(body);
  res.json(sesion);
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (req.usuarioId === undefined) {
    throw new AppError(401, "Sesión inválida");
  }
  const perfil = await seguridadService.perfil(req.usuarioId);
  res.json(perfil);
});
