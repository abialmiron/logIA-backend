import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/async-handler";
import {
  actualizarContextoIASchema,
  contextoIAIdParamSchema,
  crearContextoIASchema,
  listarContextoIASchema,
} from "./contexto-ia.schema";
import { contextoIAService } from "./contexto-ia.service";

export const listarContextosIA = asyncHandler(async (req: Request, res: Response) => {
  const query = listarContextoIASchema.parse(req.query);
  const contextos = await contextoIAService.listar(query);
  res.json(contextos);
});

export const obtenerContextoIA = asyncHandler(async (req: Request, res: Response) => {
  const { id } = contextoIAIdParamSchema.parse(req.params);
  const contexto = await contextoIAService.obtener(id);
  res.json(contexto);
});

export const crearContextoIA = asyncHandler(async (req: Request, res: Response) => {
  const body = crearContextoIASchema.parse(req.body);
  const contexto = await contextoIAService.crear(body);
  res.status(201).json(contexto);
});

export const actualizarContextoIA = asyncHandler(async (req: Request, res: Response) => {
  const { id } = contextoIAIdParamSchema.parse(req.params);
  const body = actualizarContextoIASchema.parse(req.body);
  const contexto = await contextoIAService.actualizar(id, body);
  res.json(contexto);
});

export const eliminarContextoIA = asyncHandler(async (req: Request, res: Response) => {
  const { id } = contextoIAIdParamSchema.parse(req.params);
  await contextoIAService.eliminar(id);
  res.status(204).send();
});
