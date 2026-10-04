import { prisma } from "../../shared/prisma";

export const grupoRepository = {
  crear(grupoNombre: string) {
    return prisma.grupo.create({
      data: { grupoNombre },
      select: {
        id: true,
        grupoNombre: true,
      },
    });
  },

  findActivoConAccesos(id: number) {
    return prisma.grupo.findFirst({
      where: { id, grupoBaja: null },
      select: {
        id: true,
        accesosGrupo: {
          where: { accesoGrupoValor: true },
          select: { accesoId: true },
        },
      },
    });
  },

  findMembresia(grupoId: number, usuarioId: number) {
    return prisma.grupoUsuario.findFirst({
      where: { grupoId, usuarioId },
      select: { id: true },
    });
  },

  asignarUsuario(grupoId: number, usuarioId: number) {
    return prisma.grupoUsuario.create({
      data: { grupoId, usuarioId },
      select: {
        id: true,
        grupoId: true,
        usuarioId: true,
      },
    });
  },
};
