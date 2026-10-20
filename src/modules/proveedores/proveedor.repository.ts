import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../shared/prisma";
import type { ListarProveedorFiltros } from "./proveedor.schema";

const proveedorSelect = {
  id: true,
  proveedorRazonSocial: true,
  proveedorCUIT: true,
  proveedorMail: true,
  proveedorCondIVA: true,
  proveedorBaja: true,
} satisfies Prisma.ProveedorSelect;

function armarWhere(filtros: ListarProveedorFiltros = {}): Prisma.ProveedorWhereInput {
  const where: Prisma.ProveedorWhereInput = {};

  if (!filtros.incluirBajas) {
    where.proveedorBaja = null;
  }

  if (filtros.razonSocial !== undefined) {
    where.proveedorRazonSocial = { contains: filtros.razonSocial, mode: "insensitive" };
  }

  if (filtros.cuit !== undefined) {
    where.proveedorCUIT = { contains: filtros.cuit, mode: "insensitive" };
  }

  if (filtros.mail !== undefined) {
    where.proveedorMail = { contains: filtros.mail, mode: "insensitive" };
  }

  if (filtros.condIva !== undefined) {
    where.proveedorCondIVA = filtros.condIva;
  }

  return where;
}

export const proveedorRepository = {
  listar(filtros: ListarProveedorFiltros = {}) {
    return prisma.proveedor.findMany({
      where: armarWhere(filtros),
      select: proveedorSelect,
      orderBy: { proveedorRazonSocial: "asc" },
    });
  },

  findActivo(id: number) {
    return prisma.proveedor.findFirst({
      where: { id, proveedorBaja: null },
      select: proveedorSelect,
    });
  },

  findActivosPorMail(proveedorMail: string) {
    return prisma.proveedor.findMany({
      where: {
        proveedorBaja: null,
        proveedorMail: { equals: proveedorMail, mode: "insensitive" },
      },
      select: {
        id: true,
        proveedorRazonSocial: true,
        proveedorMail: true,
      },
    });
  },

  crear(data: CrearData) {
    return prisma.proveedor.create({
      data,
      select: proveedorSelect,
    });
  },

  actualizar(id: number, data: ActualizarData) {
    return prisma.proveedor.update({
      where: { id },
      data,
      select: proveedorSelect,
    });
  },

  darDeBaja(id: number) {
    return prisma.proveedor.update({
      where: { id },
      data: { proveedorBaja: new Date() },
    });
  },
};

type CrearData = {
  proveedorRazonSocial: string;
  proveedorCUIT: string;
  proveedorMail: string;
  proveedorCondIVA?: number | null;
};

type ActualizarData = {
  proveedorRazonSocial?: string;
  proveedorCUIT?: string;
  proveedorMail?: string;
  proveedorCondIVA?: number | null;
};
