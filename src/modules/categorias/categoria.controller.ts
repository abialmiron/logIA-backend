import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/async-handler";
import {
  actualizarCategoriaSchema,
  categoriaIdParamSchema,
  crearCategoriaSchema,
  listarCategoriaSchema,
} from "./categoria.schema";
import { categoriaService } from "./categoria.service";

export const listarCategorias = asyncHandler(async (req: Request, res: Response) => {
  const query = listarCategoriaSchema.parse(req.query);
  res.json(await categoriaService.listar(query));
});

export const obtenerCategoria = asyncHandler(async (req: Request, res: Response) => {
  const { id } = categoriaIdParamSchema.parse(req.params);
  res.json(await categoriaService.obtener(id));
});

export const crearCategoria = asyncHandler(async (req: Request, res: Response) => {
  const body = crearCategoriaSchema.parse(req.body);
  res.status(201).json(await categoriaService.crear(body));
});

export const actualizarCategoria = asyncHandler(async (req: Request, res: Response) => {
  const { id } = categoriaIdParamSchema.parse(req.params);
  const body = actualizarCategoriaSchema.parse(req.body);
  res.json(await categoriaService.actualizar(id, body));
});

export const darDeBajaCategoria = asyncHandler(async (req: Request, res: Response) => {
  const { id } = categoriaIdParamSchema.parse(req.params);
  await categoriaService.darDeBaja(id);
  res.status(204).send();
});

export const reactivarCategoria = asyncHandler(async (req: Request, res: Response) => {
  const { id } = categoriaIdParamSchema.parse(req.params);
  res.json(await categoriaService.reactivar(id));
});
