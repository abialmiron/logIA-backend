import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../shared/prisma";
import type { ListarProductoFiltros } from "./producto.schema";

const talleConStock = {
  stocks: { some: { stockCantidad: { gt: 0 } } },
} satisfies Prisma.ProductoTallesWhereInput;

function productoSelect(soloConStock = false) {
  return {
    id: true,
    productoNombre: true,
    productoSKU: true,
    productoGenero: true,
    proveedorId: true,
    categoriaId: true,
    proveedor: { select: { id: true, proveedorRazonSocial: true } },
    categoria: { select: { id: true, categoriaNombre: true } },
    plataformas: {
      select: {
        plataformaId: true,
        plataforma: { select: { id: true, plataformaNombre: true, plataformaBaja: true } },
      },
    },
    talles: {
      ...(soloConStock ? { where: talleConStock } : {}),
      orderBy: { id: "asc" as const },
      select: { id: true, productoTalles: true, productoTallesAlerta: true },
    },
  } satisfies Prisma.ProductoSelect;
}

function armarWhere(
  filtros: ListarProductoFiltros = {},
  categoriaIds?: number[],
): Prisma.ProductoWhereInput {
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
  if (filtros.plataformaId !== undefined) {
    where.plataformas = { some: { plataformaId: filtros.plataformaId } };
  }
  if (filtros.genero !== undefined) {
    where.productoGenero = filtros.genero;
  }
  if (categoriaIds !== undefined) {
    where.categoriaId = { in: categoriaIds };
  }
  if (filtros.soloConStock) {
    where.talles = { some: talleConStock };
  }

  return where;
}

export const productoRepository = {
  listar(filtros: ListarProductoFiltros = {}, categoriaIds?: number[]) {
    return prisma.producto.findMany({
      where: armarWhere(filtros, categoriaIds),
      select: productoSelect(Boolean(filtros.soloConStock)),
      orderBy: { productoNombre: "asc" },
    });
  },

  findActivo(id: number) {
    return prisma.producto.findFirst({
      where: { id, productoBaja: null },
      select: productoSelect(),
    });
  },

  crear(data: {
    productoNombre: string;
    productoSKU: string;
    productoGenero: string;
    proveedorId: number;
    categoriaId: number;
  }) {
    return prisma.producto.create({ data, select: productoSelect() });
  },

  actualizar(
    id: number,
    data: {
      productoNombre?: string;
      productoSKU?: string;
      productoGenero?: string;
      proveedorId?: number;
      categoriaId?: number;
    },
  ) {
    return prisma.producto.update({ where: { id }, data, select: productoSelect() });
  },

  async reemplazarPlataformas(productoId: number, plataformasIds: number[]) {
    await prisma.productoPlataforma.deleteMany({ where: { productoId } });
    if (plataformasIds.length === 0) {
      return productoRepository.findActivo(productoId);
    }

    await prisma.productoPlataforma.createMany({
      data: plataformasIds.map((plataformaId) => ({ productoId, plataformaId })),
    });

    return productoRepository.findActivo(productoId);
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

  findTalleDeProveedor(id: number, proveedorId: number) {
    return prisma.productoTalles.findFirst({
      where: {
        id,
        producto: { productoBaja: null, proveedorId },
      },
      select: { id: true },
    });
  },

  findTallePublicadoEnPlataforma(id: number, plataformaId: number) {
    return prisma.productoTalles.findFirst({
      where: {
        id,
        producto: {
          productoBaja: null,
          plataformas: { some: { plataformaId } },
        },
      },
      select: { id: true },
    });
  },

  crearTalle(
    productoId: number,
    data: { productoTalles: string; productoTallesAlerta?: number | null },
  ) {
    return prisma.productoTalles.create({
      data: { productoId, ...data },
      select: { id: true, productoTalles: true, productoTallesAlerta: true, productoId: true },
    });
  },

  actualizarTalle(
    id: number,
    data: { productoTalles?: string; productoTallesAlerta?: number | null },
  ) {
    return prisma.productoTalles.update({
      where: { id },
      data,
      select: { id: true, productoTalles: true, productoTallesAlerta: true, productoId: true },
    });
  },

  eliminarTalle(id: number) {
    return prisma.productoTalles.delete({ where: { id } });
  },
};
