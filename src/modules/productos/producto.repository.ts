import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../shared/prisma";
import type { ListarProductoFiltros } from "./producto.schema";

const productoSelect = {
  id: true,
  productoNombre: true,
  productoSKU: true,
  proveedorId: true,
  proveedor: { select: { id: true, proveedorRazonSocial: true } },
  talles: {
    orderBy: { id: "asc" as const },
    select: { id: true, productoTalles: true },
  },
} satisfies Prisma.ProductoSelect;

function armarWhere(filtros: ListarProductoFiltros = {}): Prisma.ProductoWhereInput {
  const where: Prisma.ProductoWhereInput = { productoBaja: null };

  if (filtros.sku !== undefined) {
    where.productoSKU = { contains: filtros.sku, mode: "insensitive" };
  }
  if (filtros.nombre !== undefined) {
    where.productoNombre = { contains: filtros.nombre, mode: "insensitive" };
  }
  if (filtros.proveedorId !== undefined) {
    where.proveedorId = filtros.proveedorId;
  }

  return where;
}

export const productoRepository = {
  listar(filtros: ListarProductoFiltros = {}) {
    return prisma.producto.findMany({
      where: armarWhere(filtros),
      select: productoSelect,
      orderBy: { productoNombre: "asc" },
    });
  },

  findActivo(id: number) {
    return prisma.producto.findFirst({
      where: { id, productoBaja: null },
      select: productoSelect,
    });
  },

  crear(data: { productoNombre: string; productoSKU: string; proveedorId: number }) {
    return prisma.producto.create({ data, select: productoSelect });
  },

  actualizar(
    id: number,
    data: { productoNombre?: string; productoSKU?: string; proveedorId?: number },
  ) {
    return prisma.producto.update({ where: { id }, data, select: productoSelect });
  },

  darDeBaja(id: number) {
    return prisma.producto.update({
      where: { id },
      data: { productoBaja: new Date() },
    });
  },

  findTalle(productoId: number, id: number) {
    return prisma.productoTalles.findFirst({
      where: { id, productoId },
      select: { id: true, productoTalles: true, productoId: true },
    });
  },

  findTalleActivo(id: number) {
    return prisma.productoTalles.findFirst({
      where: { id, producto: { productoBaja: null } },
      select: { id: true },
    });
  },

  crearTalle(productoId: number, productoTalles: string) {
    return prisma.productoTalles.create({
      data: { productoId, productoTalles },
      select: { id: true, productoTalles: true, productoId: true },
    });
  },

  actualizarTalle(id: number, productoTalles: string) {
    return prisma.productoTalles.update({
      where: { id },
      data: { productoTalles },
      select: { id: true, productoTalles: true, productoId: true },
    });
  },

  eliminarTalle(id: number) {
    return prisma.productoTalles.delete({ where: { id } });
  },
};
