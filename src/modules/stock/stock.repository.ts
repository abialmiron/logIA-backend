import { Prisma } from "../../../generated/prisma/client";
import {
  COMPROBANTE_TIPO_EGRESO,
  COMPROBANTE_TIPO_INGRESO,
} from "../../shared/comprobante";
import { AppError } from "../../shared/app-error";
import { prisma } from "../../shared/prisma";

export type Tx = Prisma.TransactionClient;

const stockSelect = {
  id: true,
  stockCantidad: true,
  productoId: true,
  productoTallesId: true,
  producto: { select: { id: true, productoNombre: true, productoSKU: true } },
  productoTalles: { select: { id: true, productoTalles: true } },
} satisfies Prisma.StockSelect;

export const stockRepository = {
  listar(productoId?: number) {
    return prisma.stock.findMany({
      where: productoId === undefined ? {} : { productoId },
      select: stockSelect,
      orderBy: [{ productoId: "asc" }, { productoTallesId: "asc" }],
    });
  },

  async aplicarMovimiento(tx: Tx, productoTallesId: number, cantidad: number, tipo: number) {
    const talle = await tx.productoTalles.findUnique({
      where: { id: productoTallesId },
      include: { producto: { select: { id: true, productoNombre: true, productoBaja: true } } },
    });
    if (!talle || talle.producto.productoBaja) {
      throw new AppError(400, "El talle no existe");
    }

    const delta = tipo === COMPROBANTE_TIPO_INGRESO ? cantidad : -cantidad;
    const stock = await tx.stock.findFirst({
      where: { productoId: talle.productoId, productoTallesId },
    });

    if (!stock) {
      if (tipo === COMPROBANTE_TIPO_EGRESO) {
        throw new AppError(400, `No hay stock de ${talle.producto.productoNombre}`);
      }
      await tx.stock.create({
        data: {
          productoId: talle.productoId,
          productoTallesId,
          stockCantidad: delta,
        },
      });
      return;
    }

    const stockCantidad = stock.stockCantidad + delta;
    if (stockCantidad < 0) {
      throw new AppError(400, `No hay stock suficiente de ${talle.producto.productoNombre}`);
    }

    await tx.stock.update({
      where: { id: stock.id },
      data: { stockCantidad },
    });
  },
};
