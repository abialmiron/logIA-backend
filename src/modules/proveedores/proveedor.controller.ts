import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/async-handler";
import {
  actualizarProveedorSchema,
  crearProveedorSchema,
  proveedorIdParamSchema,
} from "./proveedor.schema";
import { proveedorService } from "./proveedor.service";

export const listarProveedores = asyncHandler(async (_req: Request, res: Response) => {
  const proveedores = await proveedorService.listar();
  res.json(proveedores);
});

export const obtenerProveedor = asyncHandler(async (req: Request, res: Response) => {
  const { id } = proveedorIdParamSchema.parse(req.params);
  const proveedor = await proveedorService.obtener(id);
  res.json(proveedor);
});

export const crearProveedor = asyncHandler(async (req: Request, res: Response) => {
  const body = crearProveedorSchema.parse(req.body);
  const proveedor = await proveedorService.crear(body);
  res.status(201).json(proveedor);
});

export const actualizarProveedor = asyncHandler(async (req: Request, res: Response) => {
  const { id } = proveedorIdParamSchema.parse(req.params);
  const body = actualizarProveedorSchema.parse(req.body);
  const proveedor = await proveedorService.actualizar(id, body);
  res.json(proveedor);
});

export const darDeBajaProveedor = asyncHandler(async (req: Request, res: Response) => {
  const { id } = proveedorIdParamSchema.parse(req.params);
  await proveedorService.darDeBaja(id);
  res.status(204).send();
});
