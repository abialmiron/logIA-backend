import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../shared/prisma";
import type { ListarUsuarioFiltros } from "./usuario.schema";

const usuarioSelect = {
  id: true,
  usuarioNombre: true,
  usuarioMail: true,
} satisfies Prisma.UsuarioSelect;

function armarWhere(filtros: ListarUsuarioFiltros = {}): Prisma.UsuarioWhereInput {
  const where: Prisma.UsuarioWhereInput = { usuarioBaja: null };

  if (filtros.nombre !== undefined) {
    where.usuarioNombre = { contains: filtros.nombre, mode: "insensitive" };
  }
  if (filtros.mail !== undefined) {
    where.usuarioMail = { contains: filtros.mail, mode: "insensitive" };
  }
  if (filtros.grupoId !== undefined) {
    where.grupoUsuarios = {
      some: {
        grupoId: filtros.grupoId,
        grupo: { grupoBaja: null },
      },
    };
  }

  return where;
}

export const usuarioRepository = {
  listar(filtros: ListarUsuarioFiltros = {}) {
    return prisma.usuario.findMany({
      where: armarWhere(filtros),
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
