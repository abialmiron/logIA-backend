import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../shared/prisma";
import type { ListarCategoriaFiltros } from "./categoria.schema";

const categoriaSelect = {
  id: true,
  categoriaNombre: true,
  categoriaPadreId: true,
  categoriaBaja: true,
  padre: { select: { id: true, categoriaNombre: true } },
} satisfies Prisma.CategoriaSelect;

export type CategoriaFila = Prisma.CategoriaGetPayload<{ select: typeof categoriaSelect }>;

export const categoriaRepository = {
  listarActivas() {
    return prisma.categoria.findMany({
      where: { categoriaBaja: null },
      select: categoriaSelect,
      orderBy: { categoriaNombre: "asc" },
    });
  },

  listar(filtros: ListarCategoriaFiltros = {}) {
    const where: Prisma.CategoriaWhereInput = {};

    if (!filtros.incluirBajas) {
      where.categoriaBaja = null;
    }

    return prisma.categoria.findMany({
      where,
      select: categoriaSelect,
      orderBy: { categoriaNombre: "asc" },
    });
  },

  findActiva(id: number) {
    return prisma.categoria.findFirst({
      where: { id, categoriaBaja: null },
      select: categoriaSelect,
    });
  },

  findById(id: number) {
    return prisma.categoria.findFirst({
      where: { id },
      select: categoriaSelect,
    });
  },

  findActivasPorPadreYNombre(categoriaPadreId: number | null, categoriaNombre: string, excluirId?: number) {
    return prisma.categoria.findFirst({
      where: {
        categoriaBaja: null,
        categoriaPadreId,
        categoriaNombre: { equals: categoriaNombre, mode: "insensitive" },
        ...(excluirId !== undefined ? { id: { not: excluirId } } : {}),
      },
      select: { id: true },
    });
  },

  contarHijosActivos(id: number) {
    return prisma.categoria.count({
      where: { categoriaPadreId: id, categoriaBaja: null },
    });
  },

  contarProductosActivos(id: number) {
    return prisma.producto.count({
      where: { categoriaId: id, productoBaja: null },
    });
  },

  crear(data: { categoriaNombre: string; categoriaPadreId: number | null }) {
    return prisma.categoria.create({
      data,
      select: categoriaSelect,
    });
  },

  actualizar(
    id: number,
    data: { categoriaNombre?: string; categoriaPadreId?: number | null },
  ) {
    return prisma.categoria.update({
      where: { id },
      data,
      select: categoriaSelect,
    });
  },

  darDeBaja(id: number) {
    return prisma.categoria.update({
      where: { id },
      data: { categoriaBaja: new Date() },
      select: categoriaSelect,
    });
  },

  reactivar(id: number) {
    return prisma.categoria.update({
      where: { id },
      data: { categoriaBaja: null },
      select: categoriaSelect,
    });
  },
};
