import { Prisma } from "../../../generated/prisma/client";
import {
  COMPROBANTE_CONFIRMADO,
  COMPROBANTE_TIPO_EGRESO,
  COMPROBANTE_TIPO_INGRESO,
} from "../../shared/comprobante";
import { AppError } from "../../shared/app-error";
import { prisma } from "../../shared/prisma";
import { mapaCategoriasParaRuta, rutaCategoriaConComas } from "../categorias/categoria-ruta";
import type { ListarStockFiltros } from "./stock.schema";

export type Tx = Prisma.TransactionClient;

function armarWhereTalles(
  filtros: ListarStockFiltros = {},
  categoriaIds?: number[],
): Prisma.ProductoTallesWhereInput {
  return {
    producto: {
      productoBaja: null,
      ...(filtros.productoId !== undefined ? { id: filtros.productoId } : {}),
      ...(filtros.sku !== undefined
        ? { productoSKU: { contains: filtros.sku, mode: "insensitive" } }
        : {}),
      ...(filtros.genero !== undefined ? { productoGenero: filtros.genero } : {}),
      ...(categoriaIds !== undefined ? { categoriaId: { in: categoriaIds } } : {}),
    },
  };
}

export const stockRepository = {
  async listarBajoAlerta() {
    const talles = await prisma.productoTalles.findMany({
      where: {
        productoTallesAlerta: { not: null },
        producto: { productoBaja: null },
      },
      select: {
        id: true,
        productoTalles: true,
        productoTallesAlerta: true,
        producto: { select: { productoSKU: true } },
        stocks: { select: { stockCantidad: true }, take: 1 },
      },
      orderBy: [{ producto: { productoSKU: "asc" } }, { productoTalles: "asc" }],
    });

    return talles
      .map((talle) => {
        const cantidad = talle.stocks[0]?.stockCantidad ?? 0;
        return {
          id: talle.id,
          sku: talle.producto.productoSKU,
          talle: talle.productoTalles,
          alerta: talle.productoTallesAlerta as number,
          cantidad,
        };
      })
      .filter((fila) => fila.cantidad < fila.alerta);
  },

  async listar(filtros: ListarStockFiltros = {}, categoriaIds?: number[]) {
    const [filas, porId] = await Promise.all([
      prisma.productoTalles.findMany({
        where: armarWhereTalles(filtros, categoriaIds),
        select: {
          id: true,
          productoTalles: true,
          producto: {
            select: {
              productoSKU: true,
              productoGenero: true,
              categoriaId: true,
            },
          },
          stocks: { select: { stockCantidad: true }, take: 1 },
        },
        orderBy: [{ producto: { productoSKU: "asc" } }, { productoTalles: "asc" }],
      }),
      mapaCategoriasParaRuta(),
    ]);

    return filas.map((fila) => ({
      id: fila.id,
      sku: fila.producto.productoSKU,
      talle: fila.productoTalles,
      cantidad: fila.stocks[0]?.stockCantidad ?? 0,
      genero: fila.producto.productoGenero,
      categoria: rutaCategoriaConComas(fila.producto.categoriaId, porId),
    }));
  },

  async ficha(productoTallesId: number) {
    const [talle, porId] = await Promise.all([
      prisma.productoTalles.findFirst({
        where: { id: productoTallesId, producto: { productoBaja: null } },
        select: {
          id: true,
          productoTalles: true,
          producto: {
            select: {
              productoSKU: true,
              productoNombre: true,
              productoGenero: true,
              categoriaId: true,
            },
          },
          stocks: { select: { stockCantidad: true }, take: 1 },
        },
      }),
      mapaCategoriasParaRuta(),
    ]);

    if (!talle) return null;

    const items = await prisma.comprobanteItem.findMany({
      where: {
        productoTallesId,
        comprobante: {
          comprobanteBaja: null,
          comprobanteEstado: COMPROBANTE_CONFIRMADO,
        },
      },
      select: {
        id: true,
        comprobanteItemCant: true,
        comprobanteItemTotal: true,
        comprobante: {
          select: {
            id: true,
            comprobantePuntoVenta: true,
            comprobanteNro: true,
            comprobanteTipo: true,
          },
        },
      },
      orderBy: [{ comprobanteId: "asc" }, { id: "asc" }],
    });

    let stock = 0;
    let sumaTotalIngresos = 0;
    let sumaCantidadIngresos = 0;
    let precioSugeridoVenta: number | null = null;

    const movimientos = items.map((item) => {
      const tipo = item.comprobante.comprobanteTipo;
      const cantidad = item.comprobanteItemCant ?? 0;
      const precioTotal = item.comprobanteItemTotal ?? 0;

      if (tipo === COMPROBANTE_TIPO_INGRESO) {
        stock += cantidad;
        sumaTotalIngresos += precioTotal;
        sumaCantidadIngresos += cantidad;
        precioSugeridoVenta =
          sumaCantidadIngresos > 0 ? sumaTotalIngresos / sumaCantidadIngresos : null;
      } else if (tipo === COMPROBANTE_TIPO_EGRESO) {
        stock -= cantidad;
      }

      return {
        id: item.id,
        comprobanteId: item.comprobante.id,
        nroComprobante: nroComprobante(
          item.comprobante.comprobantePuntoVenta,
          item.comprobante.comprobanteNro,
        ),
        tipo: tipo === COMPROBANTE_TIPO_INGRESO ? "ingreso" : "egreso",
        cantidad,
        precioTotal,
        precioPorUnidad: cantidad > 0 ? precioTotal / cantidad : null,
        stockEnEseMomento: stock,
        precioSugeridoVenta,
      };
    });

    return {
      id: talle.id,
      sku: talle.producto.productoSKU,
      nombre: talle.producto.productoNombre,
      talle: talle.productoTalles,
      cantidad: talle.stocks[0]?.stockCantidad ?? 0,
      genero: talle.producto.productoGenero,
      categoria: rutaCategoriaConComas(talle.producto.categoriaId, porId),
      precioSugeridoVenta,
      movimientos: [...movimientos].reverse(),
    };
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

function nroComprobante(puntoVenta: number | null, numero: number | null) {
  const pv = String(puntoVenta ?? 0).padStart(5, "0");
  const nro = String(numero ?? 0).padStart(8, "0");
  return `${pv}-${nro}`;
}
