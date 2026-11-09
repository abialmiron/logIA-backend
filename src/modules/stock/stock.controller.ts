import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/async-handler";
import { listarStockSchema, stockService, stockTalleIdParamSchema } from "./stock.service";

export const listarStock = asyncHandler(async (req: Request, res: Response) => {
  const query = listarStockSchema.parse(req.query);
  res.json(await stockService.listar(query));
});

export const listarStockBajoAlerta = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await stockService.listarBajoAlerta());
});

export const obtenerFichaStock = asyncHandler(async (req: Request, res: Response) => {
  const { id } = stockTalleIdParamSchema.parse(req.params);
  res.json(await stockService.ficha(id));
});
