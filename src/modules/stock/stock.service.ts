import { stockRepository } from "./stock.repository";
import type { ListarStockFiltros } from "./stock.schema";

export { listarStockSchema } from "./stock.schema";

export const stockService = {
  listar(filtros: ListarStockFiltros = {}) {
    return stockRepository.listar(filtros);
  },
};
