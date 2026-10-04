import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../shared/prisma";

const proveedorSelect = {
  id: true,
  proveedorRazonSocial: true,
  proveedorCUIT: true,
  proveedorMail: true,
  proveedorParam: true,
  proveedorCondIVA: true,
} satisfies Prisma.ProveedorSelect;

export const proveedorRepository = {
  listar() {
    return prisma.proveedor.findMany({
      where: { proveedorBaja: null },
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
  proveedorParam?: string | null;
  proveedorCondIVA?: number | null;
};

type ActualizarData = {
  proveedorRazonSocial?: string;
  proveedorCUIT?: string;
  proveedorMail?: string;
  proveedorParam?: string | null;
  proveedorCondIVA?: number | null;
};
