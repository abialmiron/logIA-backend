import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/async-handler";
import {
  actualizarProductoSchema,
  actualizarTalleSchema,
  crearProductoSchema,
  crearTalleSchema,
  productoIdParamSchema,
  talleParamSchema,
} from "./producto.schema";
import { productoService } from "./producto.service";

export const listarProductos = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await productoService.listar());
});

export const obtenerProducto = asyncHandler(async (req: Request, res: Response) => {
  const { id } = productoIdParamSchema.parse(req.params);
  res.json(await productoService.obtener(id));
});

export const crearProducto = asyncHandler(async (req: Request, res: Response) => {
  const body = crearProductoSchema.parse(req.body);
  res.status(201).json(await productoService.crear(body));
});

export const actualizarProducto = asyncHandler(async (req: Request, res: Response) => {
  const { id } = productoIdParamSchema.parse(req.params);
  const body = actualizarProductoSchema.parse(req.body);
  res.json(await productoService.actualizar(id, body));
});

export const darDeBajaProducto = asyncHandler(async (req: Request, res: Response) => {
  const { id } = productoIdParamSchema.parse(req.params);
  await productoService.darDeBaja(id);
  res.status(204).send();
});

export const crearTalle = asyncHandler(async (req: Request, res: Response) => {
  const { id } = productoIdParamSchema.parse(req.params);
  const body = crearTalleSchema.parse(req.body);
  res.status(201).json(await productoService.crearTalle(id, body));
});

export const actualizarTalle = asyncHandler(async (req: Request, res: Response) => {
  const params = talleParamSchema.parse(req.params);
  const body = actualizarTalleSchema.parse(req.body);
  res.json(await productoService.actualizarTalle(params.id, params.talleId, body));
});

export const eliminarTalle = asyncHandler(async (req: Request, res: Response) => {
  const params = talleParamSchema.parse(req.params);
  await productoService.eliminarTalle(params.id, params.talleId);
  res.status(204).send();
});
