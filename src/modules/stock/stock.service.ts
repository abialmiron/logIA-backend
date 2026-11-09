import { AppError } from "../../shared/app-error";
import { categoriaService } from "../categorias/categoria.service";
import { stockRepository } from "./stock.repository";
import type { ListarStockFiltros } from "./stock.schema";

export { listarStockSchema, stockTalleIdParamSchema } from "./stock.schema";

export const stockService = {
  async listar(filtros: ListarStockFiltros = {}) {
    let categoriaIds: number[] | undefined;
    if (filtros.categoriaId !== undefined) {
      categoriaIds = await categoriaService.idsConDescendientes(filtros.categoriaId);
    }
    return stockRepository.listar(filtros, categoriaIds);
  },

  listarBajoAlerta() {
    return stockRepository.listarBajoAlerta();
  },

  async ficha(productoTallesId: number) {
    const ficha = await stockRepository.ficha(productoTallesId);
    if (!ficha) {
      throw new AppError(404, "El stock no existe");
    }
    return ficha;
  },
};
