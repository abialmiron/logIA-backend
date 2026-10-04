import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/async-handler";
import { crearUsuarioSchema } from "./usuario.schema";
import { usuarioService } from "./usuario.service";

export const crearUsuario = asyncHandler(async (req: Request, res: Response) => {
  const body = crearUsuarioSchema.parse(req.body);
  const usuario = await usuarioService.crear(body);
  res.status(201).json(usuario);
});
