import { prisma } from "../../shared/prisma";

export const accesoRepository = {
  findById(id: string) {
    return prisma.acceso.findUnique({
      where: { id },
      select: { id: true },
    });
  },

  crear(data: {
    id: string;
    accesoPadre?: string | null;
    accesoOrden?: number;
    accesoDescripcion?: string;
  }) {
    return prisma.acceso.create({
      data,
      select: {
        id: true,
        accesoPadre: true,
        accesoOrden: true,
        accesoDescripcion: true,
      },
    });
  },
};
