import type { Request, Response } from "express";
import { AppError } from "../../shared/app-error";
import { asyncHandler } from "../../shared/async-handler";
import { actualizarUsuarioSchema, crearUsuarioSchema, usuarioIdParamSchema } from "./usuario.schema";
import { usuarioService } from "./usuario.service";

function actorId(req: Request) {
  if (req.usuarioId === undefined) {
    throw new AppError(401, "Sesión inválida");
  }
  return req.usuarioId;
}

export const listarUsuarios = asyncHandler(async (_req: Request, res: Response) => {
  const usuarios = await usuarioService.listar();
  res.json(usuarios);
});

export const obtenerUsuario = asyncHandler(async (req: Request, res: Response) => {
  const { id } = usuarioIdParamSchema.parse(req.params);
  const usuario = await usuarioService.obtener(id);
  res.json(usuario);
});

export const crearUsuario = asyncHandler(async (req: Request, res: Response) => {
  const body = crearUsuarioSchema.parse(req.body);
  const usuario = await usuarioService.crear(body);
  res.status(201).json(usuario);
});

export const actualizarUsuario = asyncHandler(async (req: Request, res: Response) => {
  const { id } = usuarioIdParamSchema.parse(req.params);
  const body = actualizarUsuarioSchema.parse(req.body);
  const usuario = await usuarioService.actualizar(id, body, actorId(req));
  res.json(usuario);
});

export const darDeBajaUsuario = asyncHandler(async (req: Request, res: Response) => {
  const { id } = usuarioIdParamSchema.parse(req.params);
  await usuarioService.darDeBaja(id, actorId(req));
  res.status(204).send();
});
