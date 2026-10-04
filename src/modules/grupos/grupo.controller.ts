import type { Request, Response } from "express";
import { AppError } from "../../shared/app-error";
import { asyncHandler } from "../../shared/async-handler";
import { asignarUsuarioSchema, crearGrupoSchema, grupoIdParamSchema } from "./grupo.schema";
import { grupoService } from "./grupo.service";

export const crearGrupo = asyncHandler(async (req: Request, res: Response) => {
  const body = crearGrupoSchema.parse(req.body);
  const grupo = await grupoService.crear(body);
  res.status(201).json(grupo);
});

export const asignarUsuario = asyncHandler(async (req: Request, res: Response) => {
  if (req.usuarioId === undefined) {
    throw new AppError(401, "Sesión inválida");
  }

  const params = grupoIdParamSchema.parse(req.params);
  const body = asignarUsuarioSchema.parse(req.body);
  const membresia = await grupoService.asignarUsuario(params.grupoId, body, req.usuarioId);
  res.status(201).json(membresia);
});
