import { prisma } from "../../shared/prisma";

export const usuarioRepository = {
  findByMail(usuarioMail: string) {
    return prisma.usuario.findUnique({
      where: { usuarioMail },
      select: { id: true },
    });
  },

  findActivoById(id: number) {
    return prisma.usuario.findFirst({
      where: { id, usuarioBaja: null },
      select: { id: true },
    });
  },

  crear(data: { usuarioNombre: string; usuarioMail: string; usuarioContrasenia: string }) {
    return prisma.usuario.create({
      data,
      select: {
        id: true,
        usuarioNombre: true,
        usuarioMail: true,
      },
    });
  },
};
