import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/async-handler";
import {
  actualizarPlataformaSchema,
  crearPlataformaSchema,
  plataformaIdParamSchema,
} from "./plataforma.schema";
import { plataformaService } from "./plataforma.service";

export const listarPlataformas = asyncHandler(async (_req: Request, res: Response) => {
  const plataformas = await plataformaService.listar();
  res.json(plataformas);
});

export const obtenerPlataforma = asyncHandler(async (req: Request, res: Response) => {
  const { id } = plataformaIdParamSchema.parse(req.params);
  const plataforma = await plataformaService.obtener(id);
  res.json(plataforma);
});

export const crearPlataforma = asyncHandler(async (req: Request, res: Response) => {
  const body = crearPlataformaSchema.parse(req.body);
  const plataforma = await plataformaService.crear(body);
  res.status(201).json(plataforma);
});

export const actualizarPlataforma = asyncHandler(async (req: Request, res: Response) => {
  const { id } = plataformaIdParamSchema.parse(req.params);
  const body = actualizarPlataformaSchema.parse(req.body);
  const plataforma = await plataformaService.actualizar(id, body);
  res.json(plataforma);
});

export const darDeBajaPlataforma = asyncHandler(async (req: Request, res: Response) => {
  const { id } = plataformaIdParamSchema.parse(req.params);
  await plataformaService.darDeBaja(id);
  res.status(204).send();
});
