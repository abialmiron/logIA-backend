import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../shared/prisma";
import type { ListarPlataformaFiltros } from "./plataforma.schema";

const plataformaSelect = {
  id: true,
  plataformaNombre: true,
  plataformaMail: true,
  plataformaBaja: true,
} satisfies Prisma.PlataformaSelect;

function armarWhere(filtros: ListarPlataformaFiltros = {}): Prisma.PlataformaWhereInput {
  const where: Prisma.PlataformaWhereInput = {};

  if (!filtros.incluirBajas) {
    where.plataformaBaja = null;
  }

  if (filtros.nombre !== undefined) {
    where.plataformaNombre = { contains: filtros.nombre, mode: "insensitive" };
  }

  if (filtros.mail !== undefined) {
    where.plataformaMail = { contains: filtros.mail, mode: "insensitive" };
  }

  return where;
}

export const plataformaRepository = {
  listar(filtros: ListarPlataformaFiltros = {}) {
    return prisma.plataforma.findMany({
      where: armarWhere(filtros),
      select: plataformaSelect,
      orderBy: { plataformaNombre: "asc" },
    });
  },

  findActiva(id: number) {
    return prisma.plataforma.findFirst({
      where: { id, plataformaBaja: null },
      select: plataformaSelect,
    });
  },

  findActivasPorMail(plataformaMail: string) {
    return prisma.plataforma.findMany({
      where: {
        plataformaBaja: null,
        plataformaMail: { equals: plataformaMail, mode: "insensitive" },
      },
      select: {
        id: true,
        plataformaNombre: true,
        plataformaMail: true,
      },
    });
  },

  crear(data: CrearData) {
    return prisma.plataforma.create({
      data,
      select: plataformaSelect,
    });
  },

  actualizar(id: number, data: ActualizarData) {
    return prisma.plataforma.update({
      where: { id },
      data,
      select: plataformaSelect,
    });
  },

  darDeBaja(id: number) {
    return prisma.plataforma.update({
      where: { id },
      data: { plataformaBaja: new Date() },
    });
  },
};

type CrearData = {
  plataformaNombre: string;
  plataformaMail: string;
};

type ActualizarData = {
  plataformaNombre?: string;
  plataformaMail?: string;
};
