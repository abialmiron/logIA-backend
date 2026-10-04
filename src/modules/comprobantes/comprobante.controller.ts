import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/async-handler";
import {
  actualizarComprobanteSchema,
  actualizarItemSchema,
  comprobanteIdParamSchema,
  crearComprobanteConfirmadoSchema,
  crearItemSchema,
  itemParamSchema,
  listarComprobanteSchema,
} from "./comprobante.schema";
import { comprobanteService } from "./comprobante.service";

export const listarComprobantes = asyncHandler(async (req: Request, res: Response) => {
  const query = listarComprobanteSchema.parse(req.query);
  res.json(await comprobanteService.listar(query.estado));
});

export const obtenerComprobante = asyncHandler(async (req: Request, res: Response) => {
  const { id } = comprobanteIdParamSchema.parse(req.params);
  res.json(await comprobanteService.obtener(id));
});

export const crearComprobanteConfirmado = asyncHandler(async (req: Request, res: Response) => {
  const body = crearComprobanteConfirmadoSchema.parse(req.body);
  res.status(201).json(await comprobanteService.crearConfirmado(body));
});

export const actualizarComprobante = asyncHandler(async (req: Request, res: Response) => {
  const { id } = comprobanteIdParamSchema.parse(req.params);
  const body = actualizarComprobanteSchema.parse(req.body);
  res.json(await comprobanteService.actualizar(id, body));
});

export const confirmarComprobante = asyncHandler(async (req: Request, res: Response) => {
  const { id } = comprobanteIdParamSchema.parse(req.params);
  res.json(await comprobanteService.confirmar(id));
});

export const eliminarComprobante = asyncHandler(async (req: Request, res: Response) => {
  const { id } = comprobanteIdParamSchema.parse(req.params);
  await comprobanteService.eliminar(id);
  res.status(204).send();
});

export const crearItem = asyncHandler(async (req: Request, res: Response) => {
  const { id } = comprobanteIdParamSchema.parse(req.params);
  const body = crearItemSchema.parse(req.body);
  res.status(201).json(await comprobanteService.crearItem(id, body));
});

export const actualizarItem = asyncHandler(async (req: Request, res: Response) => {
  const params = itemParamSchema.parse(req.params);
  const body = actualizarItemSchema.parse(req.body);
  res.json(await comprobanteService.actualizarItem(params.id, params.itemId, body));
});

export const eliminarItem = asyncHandler(async (req: Request, res: Response) => {
  const params = itemParamSchema.parse(req.params);
  await comprobanteService.eliminarItem(params.id, params.itemId);
  res.status(204).send();
});
