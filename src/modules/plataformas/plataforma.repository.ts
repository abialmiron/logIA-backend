import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../shared/prisma";

const plataformaSelect = {
  id: true,
  plataformaNombre: true,
  plataformaMail: true,
  plataformaParam: true,
} satisfies Prisma.PlataformaSelect;

export const plataformaRepository = {
  listar() {
    return prisma.plataforma.findMany({
      where: { plataformaBaja: null },
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
  plataformaParam?: string | null;
};

type ActualizarData = {
  plataformaNombre?: string;
  plataformaMail?: string;
  plataformaParam?: string | null;
};
