import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../shared/prisma";

const usuarioSelect = {
  id: true,
  usuarioNombre: true,
  usuarioMail: true,
} satisfies Prisma.UsuarioSelect;

export const usuarioRepository = {
  listar() {
    return prisma.usuario.findMany({
      where: { usuarioBaja: null },
      select: usuarioSelect,
      orderBy: { usuarioNombre: "asc" },
    });
  },

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

  findActivosByIds(ids: number[]) {
    return prisma.usuario.findMany({
      where: { id: { in: ids }, usuarioBaja: null },
      select: { id: true },
    });
  },

  findActivo(id: number) {
    return prisma.usuario.findFirst({
      where: { id, usuarioBaja: null },
      select: usuarioSelect,
    });
  },

  crear(data: { usuarioNombre: string; usuarioMail: string; usuarioContrasenia: string }) {
    return prisma.usuario.create({
      data,
      select: usuarioSelect,
    });
  },

  actualizar(id: number, data: { usuarioNombre?: string; usuarioContrasenia?: string }) {
    return prisma.usuario.update({
      where: { id },
      data,
      select: usuarioSelect,
    });
  },

  darDeBaja(id: number) {
    return prisma.usuario.update({
      where: { id },
      data: { usuarioBaja: new Date() },
    });
  },
};
