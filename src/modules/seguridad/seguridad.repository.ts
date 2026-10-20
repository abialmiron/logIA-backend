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

  findActivoByMail(usuarioMail: string) {
    return prisma.usuario.findFirst({
      where: { usuarioMail, usuarioBaja: null },
      select: { id: true, usuarioMail: true, usuarioNombre: true },
    });
  },

  crearRecuperacion(usuarioId: number, tokenHash: string, expira: Date) {
    return prisma.recuperacionContrasena.create({
      data: { usuarioId, tokenHash, expira },
    });
  },

  findRecuperacionVigente(tokenHash: string) {
    return prisma.recuperacionContrasena.findFirst({
      where: {
        tokenHash,
        usadoEn: null,
        expira: { gt: new Date() },
        usuario: { usuarioBaja: null },
      },
      include: {
        usuario: { select: { id: true } },
      },
    });
  },

  async marcarRecuperacionUsadaYCambiarClave(
    recuperacionId: number,
    usuarioId: number,
    usuarioContrasenia: string,
  ) {
    await prisma.$transaction([
      prisma.recuperacionContrasena.update({
        where: { id: recuperacionId },
        data: { usadoEn: new Date() },
      }),
      prisma.usuario.update({
        where: { id: usuarioId },
        data: { usuarioContrasenia },
      }),
    ]);
  },
};
