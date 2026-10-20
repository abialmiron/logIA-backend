import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/async-handler";
import { AppError } from "../../shared/app-error";
import {
  loginSchema,
  olvideContrasenaSchema,
  recuperarContrasenaSchema,
} from "./seguridad.schema";
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

export const olvideContrasena = asyncHandler(async (req: Request, res: Response) => {
  const body = olvideContrasenaSchema.parse(req.body);
  const resultado = await seguridadService.olvideContrasena(body);
  res.json(resultado);
});

export const recuperarContrasena = asyncHandler(async (req: Request, res: Response) => {
  const body = recuperarContrasenaSchema.parse(req.body);
  const resultado = await seguridadService.recuperarContrasena(body);
  res.json(resultado);
});
