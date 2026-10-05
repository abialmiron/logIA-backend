import { GRUPO_ADMINISTRADOR } from "../grupos/grupo.repository";
import { prisma } from "../../shared/prisma";

const accesoSelect = {
  id: true,
  accesoPadre: true,
  accesoOrden: true,
  accesoDescripcion: true,
} as const;

export const accesoRepository = {
  listar() {
    return prisma.acceso.findMany({
      select: accesoSelect,
      orderBy: [{ accesoOrden: "asc" }, { id: "asc" }],
    });
  },

  findByIds(ids: string[]) {
    return prisma.acceso.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });
  },

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
    return prisma.$transaction(async (tx) => {
      const acceso = await tx.acceso.create({
        data,
        select: accesoSelect,
      });

      const grupos = await tx.grupo.findMany({
        where: {
          grupoBaja: null,
          grupoNombre: { equals: GRUPO_ADMINISTRADOR, mode: "insensitive" },
        },
        select: { id: true },
      });
      const catalogo = await tx.acceso.findMany({ select: { id: true } });

      for (const grupo of grupos) {
        const actuales = await tx.accesoGrupo.findMany({
          where: { grupoId: grupo.id },
          select: { accesoId: true, accesoGrupoValor: true },
        });
        const porAcceso = new Map(actuales.map((fila) => [fila.accesoId, fila.accesoGrupoValor]));
        const faltantes = catalogo.filter((item) => !porAcceso.has(item.id));
        const apagados = catalogo.filter((item) => porAcceso.get(item.id) === false);

        if (faltantes.length > 0) {
          await tx.accesoGrupo.createMany({
            data: faltantes.map((item) => ({
              grupoId: grupo.id,
              accesoId: item.id,
              accesoGrupoValor: true,
            })),
          });
        }

        if (apagados.length > 0) {
          await tx.accesoGrupo.updateMany({
            where: { grupoId: grupo.id, accesoId: { in: apagados.map((item) => item.id) } },
            data: { accesoGrupoValor: true },
          });
        }
      }

      return acceso;
    });
  },
};
