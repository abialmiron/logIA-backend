import { Prisma } from "../../../generated/prisma/client";
import {
  formatearNumeroComprobante,
  formatearPuntoVenta,
} from "../../shared/formato-comprobante";
import { prisma } from "../../shared/prisma";
import type { Tx } from "../stock/stock.repository";
import type { ListarComprobanteFiltros } from "./comprobante.schema";

const comprobanteSelect = {
  id: true,
  comprobantePuntoVenta: true,
  comprobanteNro: true,
  comprobanteTipo: true,
  comprobanteEstado: true,
  comprobanteTotal: true,
  comprobanteIVA: true,
  comprobanteJSON: true,
  comprobanteBaja: true,
  proveedorId: true,
  plataformaId: true,
  proveedor: { select: { id: true, proveedorRazonSocial: true, proveedorBaja: true } },
  plataforma: { select: { id: true, plataformaNombre: true, plataformaBaja: true } },
  items: {
    orderBy: { id: "asc" as const },
    select: {
      id: true,
      comprobanteItemCant: true,
      productoTallesId: true,
      comprobanteItemDesc: true,
      comprobanteItemIVA: true,
      comprobanteItemTotal: true,
      productoTalles: {
        select: {
          id: true,
          productoTalles: true,
          producto: { select: { id: true, productoNombre: true, productoSKU: true } },
        },
      },
    },
  },
} satisfies Prisma.ComprobanteSelect;

type ComprobanteRaw = Prisma.ComprobanteGetPayload<{ select: typeof comprobanteSelect }>;
type Db = Tx | typeof prisma;

function presentar(comprobante: ComprobanteRaw) {
  return {
    ...comprobante,
    comprobantePuntoVenta: formatearPuntoVenta(comprobante.comprobantePuntoVenta),
    comprobanteNro: formatearNumeroComprobante(comprobante.comprobanteNro),
  };
}

function armarWhere(filtros: ListarComprobanteFiltros = {}): Prisma.ComprobanteWhereInput {
  const where: Prisma.ComprobanteWhereInput = {};

  if (filtros.estado === "eliminados") {
    where.comprobanteBaja = { not: null };
  } else {
    where.comprobanteBaja = null;
    if (filtros.estado === 1 || filtros.estado === 2) {
      where.comprobanteEstado = filtros.estado;
    }
  }

  if (filtros.puntoVenta !== undefined) {
    where.comprobantePuntoVenta = Number(filtros.puntoVenta);
  }

  if (filtros.tipo !== undefined) {
    where.comprobanteTipo = filtros.tipo;
  }

  if (filtros.proveedorId !== undefined) {
    where.proveedorId = filtros.proveedorId;
  }

  if (filtros.plataformaId !== undefined) {
    where.plataformaId = filtros.plataformaId;
  }

  if (!filtros.incluirOrigenesBaja) {
    where.AND = [
      {
        OR: [{ proveedorId: null }, { proveedor: { is: { proveedorBaja: null } } }],
      },
      {
        OR: [{ plataformaId: null }, { plataforma: { is: { plataformaBaja: null } } }],
      },
    ];
  }

  return where;
}

export const comprobanteRepository = {
  async listar(filtros: ListarComprobanteFiltros = {}) {
    const filas = await prisma.comprobante.findMany({
      where: armarWhere(filtros),
      select: comprobanteSelect,
      orderBy: { id: "desc" },
    });

    const conNumero =
      filtros.numero === undefined
        ? filas
        : filas.filter((fila) => String(fila.comprobanteNro ?? "").includes(filtros.numero as string));

    return conNumero.map(presentar);
  },

  async findById(id: number, db: Db = prisma) {
    const comprobante = await db.comprobante.findUnique({
      where: { id },
      select: comprobanteSelect,
    });
    return comprobante ? presentar(comprobante) : null;
  },

  crear(data: Prisma.ComprobanteUncheckedCreateInput, db: Db = prisma) {
    return db.comprobante.create({ data, select: { id: true } });
  },

  async actualizar(id: number, data: Prisma.ComprobanteUncheckedUpdateInput, db: Db = prisma) {
    const comprobante = await db.comprobante.update({
      where: { id },
      data,
      select: comprobanteSelect,
    });
    return presentar(comprobante);
  },

  async darDeBaja(id: number, db: Db = prisma) {
    await db.comprobante.update({
      where: { id },
      data: { comprobanteBaja: new Date() },
    });
  },

  crearItem(data: Prisma.ComprobanteItemUncheckedCreateInput, db: Db = prisma) {
    return db.comprobanteItem.create({ data, select: { id: true } });
  },

  actualizarItem(id: number, data: Prisma.ComprobanteItemUncheckedUpdateInput, db: Db = prisma) {
    return db.comprobanteItem.update({ where: { id }, data, select: { id: true } });
  },

  findItem(comprobanteId: number, id: number) {
    return prisma.comprobanteItem.findFirst({
      where: { id, comprobanteId },
      select: { id: true },
    });
  },

  listarItems(comprobanteId: number) {
    return prisma.comprobanteItem.findMany({
      where: { comprobanteId },
      select: { id: true },
    });
  },

  eliminarItem(id: number) {
    return prisma.comprobanteItem.delete({ where: { id } });
  },
};
