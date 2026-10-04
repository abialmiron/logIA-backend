import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../shared/prisma";

const usuarioConAccesos = {
  grupoUsuarios: {
    where: {
      grupo: { grupoBaja: null },
    },
    include: {
      grupo: {
        include: {
          accesosGrupo: {
            where: { accesoGrupoValor: true },
            include: { acceso: true },
          },
        },
      },
    },
  },
} satisfies Prisma.UsuarioInclude;

export type UsuarioConAccesos = Prisma.UsuarioGetPayload<{
  include: typeof usuarioConAccesos;
}>;

export const seguridadRepository = {
  findByMailConAccesos(usuarioMail: string) {
    return prisma.usuario.findUnique({
      where: { usuarioMail },
      include: usuarioConAccesos,
    });
  },

  findActivoById(id: number) {
    return prisma.usuario.findFirst({
      where: { id, usuarioBaja: null },
      select: { id: true },
    });
  },

  tieneAcceso(usuarioId: number, accesoId: string) {
    return prisma.accesoGrupo.findFirst({
      where: {
        accesoId,
        accesoGrupoValor: true,
        grupo: {
          grupoBaja: null,
          grupoUsuarios: { some: { usuarioId } },
        },
      },
      select: { id: true },
    });
  },

  async idsDeAccesos(usuarioId: number) {
    const filas = await prisma.accesoGrupo.findMany({
      where: {
        accesoGrupoValor: true,
        grupo: {
          grupoBaja: null,
          grupoUsuarios: { some: { usuarioId } },
        },
      },
      select: { accesoId: true },
      distinct: ["accesoId"],
    });

    return filas.map((fila) => fila.accesoId);
  },

  findActivoConAccesos(id: number) {
    return prisma.usuario.findFirst({
      where: { id, usuarioBaja: null },
      include: usuarioConAccesos,
    });
  },
};
