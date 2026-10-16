import { Prisma } from "../../../generated/prisma/client";
import {
  COMPROBANTE_TIPO_EGRESO,
  COMPROBANTE_TIPO_INGRESO,
} from "../../shared/comprobante";
import { AppError } from "../../shared/app-error";
import { prisma } from "../../shared/prisma";
import type { ListarStockFiltros } from "./stock.schema";

export type Tx = Prisma.TransactionClient;

function armarWhereTalles(filtros: ListarStockFiltros = {}): Prisma.ProductoTallesWhereInput {
  const where: Prisma.ProductoTallesWhereInput = {
    producto: {
      productoBaja: null,
      ...(filtros.productoId !== undefined ? { id: filtros.productoId } : {}),
      ...(filtros.sku !== undefined
        ? { productoSKU: { contains: filtros.sku, mode: "insensitive" } }
        : {}),
    },
  };

  return where;
}

export const stockRepository = {
  async listar(filtros: ListarStockFiltros = {}) {
    const filas = await prisma.productoTalles.findMany({
      where: armarWhereTalles(filtros),
      select: {
        id: true,
        productoTalles: true,
        producto: { select: { productoSKU: true } },
        stocks: { select: { stockCantidad: true }, take: 1 },
      },
      orderBy: [{ producto: { productoSKU: "asc" } }, { productoTalles: "asc" }],
    });

    return filas.map((fila) => ({
      id: fila.id,
      sku: fila.producto.productoSKU,
      talle: fila.productoTalles,
      cantidad: fila.stocks[0]?.stockCantidad ?? 0,
    }));
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
