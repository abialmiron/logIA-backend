import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../shared/prisma";

const contextoSelect = {
  id: true,
  archivoEjemplo: true,
  mapeoCampo: true,
  aaasttem: true,
  proveedorId: true,
  plataformaId: true,
  proveedor: {
    select: {
      id: true,
      proveedorRazonSocial: true,
    },
  },
  plataforma: {
    select: {
      id: true,
      plataformaNombre: true,
    },
  },
} satisfies Prisma.ContextoIASelect;

export const contextoIARepository = {
  listar(filtro: { proveedorId?: number; plataformaId?: number }) {
    return prisma.contextoIA.findMany({
      where: {
        ...(filtro.proveedorId !== undefined ? { proveedorId: filtro.proveedorId } : {}),
        ...(filtro.plataformaId !== undefined ? { plataformaId: filtro.plataformaId } : {}),
      },
      select: contextoSelect,
      orderBy: { id: "asc" },
    });
  },

  findById(id: number) {
    return prisma.contextoIA.findUnique({
      where: { id },
      select: contextoSelect,
    });
  },

  crear(data: ContextoData) {
    return prisma.contextoIA.create({
      data,
      select: contextoSelect,
    });
  },

  actualizar(id: number, data: ContextoData) {
    return prisma.contextoIA.update({
      where: { id },
      data,
      select: contextoSelect,
    });
  },

  eliminar(id: number) {
    return prisma.contextoIA.delete({
      where: { id },
    });
  },
};

type ContextoData = {
  proveedorId?: number | null;
  plataformaId?: number | null;
  archivoEjemplo?: string | null;
  mapeoCampo?: string | null;
  aaasttem?: string | null;
};
