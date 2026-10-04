import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/async-handler";
import { listarStockSchema, stockService } from "./stock.service";

export const listarStock = asyncHandler(async (req: Request, res: Response) => {
  const query = listarStockSchema.parse(req.query);
  const stock = await stockService.listar(query.productoId);
  res.json(stock);
});
