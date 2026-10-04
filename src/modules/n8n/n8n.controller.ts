import type { Request, Response } from "express";
import { contextoIAService } from "../contextos-ia/contexto-ia.service";
import { asyncHandler } from "../../shared/async-handler";
import { crearComprobantePendienteSchema } from "../comprobantes/comprobante.schema";
import { comprobanteService } from "../comprobantes/comprobante.service";
import { contextoPorMailSchema } from "./n8n.schema";

export const contextoPorMail = asyncHandler(async (req: Request, res: Response) => {
  const { mail } = contextoPorMailSchema.parse(req.query);
  const contexto = await contextoIAService.porMail(mail);
  res.json(contexto);
});

export const cargarComprobantePendiente = asyncHandler(async (req: Request, res: Response) => {
  const body = crearComprobantePendienteSchema.parse(req.body);
  const comprobante = await comprobanteService.crearPendiente(body);
  res.status(201).json(comprobante);
});
