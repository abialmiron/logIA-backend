import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../shared/prisma";
import type { Tx } from "../stock/stock.repository";

const comprobanteSelect = {
  id: true,
  comprobantePuntoVenta: true,
  comprobanteNro: true,
  comprobanteTipo: true,
  comprobanteEstado: true,
  comprobanteTotal: true,
  comprobanteIVA: true,
  comprobante3SON: true,
  proveedorId: true,
  plataformaId: true,
  proveedor: { select: { id: true, proveedorRazonSocial: true } },
  plataforma: { select: { id: true, plataformaNombre: true } },
  items: {
    orderBy: { id: "asc" },
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

type Db = Tx | typeof prisma;

export const comprobanteRepository = {
  listar(estado?: number) {
    return prisma.comprobante.findMany({
      where: estado === undefined ? {} : { comprobanteEstado: estado },
      select: comprobanteSelect,
      orderBy: { id: "desc" },
    });
  },

  findById(id: number, db: Db = prisma) {
    return db.comprobante.findUnique({
      where: { id },
      select: comprobanteSelect,
    });
  },

  crear(data: Prisma.ComprobanteUncheckedCreateInput, db: Db = prisma) {
    return db.comprobante.create({ data, select: { id: true } });
  },

  actualizar(id: number, data: Prisma.ComprobanteUncheckedUpdateInput, db: Db = prisma) {
    return db.comprobante.update({
      where: { id },
      data,
      select: comprobanteSelect,
    });
  },

  async eliminar(id: number, db: Db = prisma) {
    await db.comprobanteItem.deleteMany({ where: { comprobanteId: id } });
    await db.comprobante.delete({ where: { id } });
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

  eliminarItem(id: number) {
    return prisma.comprobanteItem.delete({ where: { id } });
  },
};
