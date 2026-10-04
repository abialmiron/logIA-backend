import { z } from "zod";
import { stockRepository } from "./stock.repository";

export const listarStockSchema = z.object({
  productoId: z.coerce.number().int().positive().optional(),
});

export const stockService = {
  listar(productoId?: number) {
    return stockRepository.listar(productoId);
  },
};
