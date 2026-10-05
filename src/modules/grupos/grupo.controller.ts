import type { Request, Response } from "express";
import { AppError } from "../../shared/app-error";
import { asyncHandler } from "../../shared/async-handler";
import {
  actualizarGrupoSchema,
  asignarUsuarioSchema,
  crearGrupoSchema,
  grupoIdParamSchema,
  grupoUsuarioParamsSchema,
} from "./grupo.schema";
import { grupoService } from "./grupo.service";

function actorId(req: Request) {
  if (req.usuarioId === undefined) {
    throw new AppError(401, "Sesión inválida");
  }
  return req.usuarioId;
}

export const listarGrupos = asyncHandler(async (_req: Request, res: Response) => {
  const grupos = await grupoService.listar();
  res.json(grupos);
});

export const obtenerGrupo = asyncHandler(async (req: Request, res: Response) => {
  const { id } = grupoIdParamSchema.parse(req.params);
  const grupo = await grupoService.obtener(id);
  res.json(grupo);
});

export const crearGrupo = asyncHandler(async (req: Request, res: Response) => {
  const body = crearGrupoSchema.parse(req.body);
  const grupo = await grupoService.crear(body, actorId(req));
  res.status(201).json(grupo);
});

export const actualizarGrupo = asyncHandler(async (req: Request, res: Response) => {
  const { id } = grupoIdParamSchema.parse(req.params);
  const body = actualizarGrupoSchema.parse(req.body);
  const grupo = await grupoService.actualizar(id, body, actorId(req));
  res.json(grupo);
});

export const darDeBajaGrupo = asyncHandler(async (req: Request, res: Response) => {
  const { id } = grupoIdParamSchema.parse(req.params);
  await grupoService.darDeBaja(id, actorId(req));
  res.status(204).send();
});

export const listarUsuariosDelGrupo = asyncHandler(async (req: Request, res: Response) => {
  const { id } = grupoIdParamSchema.parse(req.params);
  const usuarios = await grupoService.listarUsuarios(id);
  res.json(usuarios);
});

export const asignarUsuario = asyncHandler(async (req: Request, res: Response) => {
  const { id } = grupoIdParamSchema.parse(req.params);
  const body = asignarUsuarioSchema.parse(req.body);
  const membresia = await grupoService.asignarUsuario(id, body, actorId(req));
  res.status(201).json(membresia);
});

export const quitarUsuario = asyncHandler(async (req: Request, res: Response) => {
  const { id, usuarioId } = grupoUsuarioParamsSchema.parse(req.params);
  await grupoService.quitarUsuario(id, usuarioId, actorId(req));
  res.status(204).send();
});
