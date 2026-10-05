import { prisma } from "../../shared/prisma";

export const GRUPO_ADMINISTRADOR = "Administrador";

const accesoSelect = {
  id: true,
  accesoPadre: true,
  accesoOrden: true,
  accesoDescripcion: true,
} as const;

const usuarioSelect = {
  id: true,
  usuarioNombre: true,
  usuarioMail: true,
} as const;

const grupoDetalleSelect = {
  id: true,
  grupoNombre: true,
  accesosGrupo: {
    where: { accesoGrupoValor: true },
    select: { acceso: { select: accesoSelect } },
  },
  grupoUsuarios: {
    where: { usuario: { usuarioBaja: null } },
    select: { usuario: { select: usuarioSelect } },
  },
} as const;

type GrupoDetalle = {
  id: number;
  grupoNombre: string;
  accesosGrupo: {
    acceso: {
      id: string;
      accesoPadre: string | null;
      accesoOrden: number | null;
      accesoDescripcion: string | null;
    };
  }[];
  grupoUsuarios: {
    usuario: {
      id: number;
      usuarioNombre: string;
      usuarioMail: string;
    };
  }[];
};

function presentar(grupo: GrupoDetalle) {
  const accesos = grupo.accesosGrupo.map((fila) => fila.acceso).sort((a, b) => {
    const ordenA = a.accesoOrden ?? Number.MAX_SAFE_INTEGER;
    const ordenB = b.accesoOrden ?? Number.MAX_SAFE_INTEGER;
    if (ordenA !== ordenB) return ordenA - ordenB;
    return a.id.localeCompare(b.id);
  });
  const usuarios = [...grupo.grupoUsuarios.map((fila) => fila.usuario)].sort((a, b) =>
    a.usuarioNombre.localeCompare(b.usuarioNombre, "es"),
  );
  return { id: grupo.id, grupoNombre: grupo.grupoNombre, accesos, usuarios };
}

const grupoSelect = {
  id: true,
  grupoNombre: true,
} as const;

const membresiaSelect = {
  id: true,
  grupoId: true,
  usuarioId: true,
  usuario: {
    select: {
      id: true,
      usuarioNombre: true,
      usuarioMail: true,
    },
  },
} as const;

export const grupoRepository = {
  async listar() {
    const grupos = await prisma.grupo.findMany({
      where: { grupoBaja: null },
      select: grupoDetalleSelect,
      orderBy: { grupoNombre: "asc" },
    });
    return grupos.map((grupo) => presentar(grupo));
  },

  async findDetalle(id: number) {
    const grupo = await prisma.grupo.findFirst({
      where: { id, grupoBaja: null },
      select: grupoDetalleSelect,
    });
    return grupo ? presentar(grupo) : null;
  },

  esAdministrador(usuarioId: number) {
    return prisma.grupoUsuario.findFirst({
      where: {
        usuarioId,
        usuario: { usuarioBaja: null },
        grupo: {
          grupoBaja: null,
          grupoNombre: { equals: GRUPO_ADMINISTRADOR, mode: "insensitive" },
        },
      },
      select: { id: true },
    });
  },

  contarUsuariosActivos(grupoId: number) {
    return prisma.grupoUsuario.count({
      where: { grupoId, usuario: { usuarioBaja: null } },
    });
  },

  findActivo(id: number) {
    return prisma.grupo.findFirst({
      where: { id, grupoBaja: null },
      select: grupoSelect,
    });
  },

  crear(grupoNombre: string) {
    return prisma.grupo.create({
      data: { grupoNombre },
      select: grupoSelect,
    });
  },

  actualizar(id: number, grupoNombre: string) {
    return prisma.grupo.update({
      where: { id },
      data: { grupoNombre },
      select: grupoSelect,
    });
  },

  darDeBaja(id: number) {
    return prisma.grupo.update({
      where: { id },
      data: { grupoBaja: new Date() },
    });
  },

  listarUsuarios(grupoId: number) {
    return prisma.grupoUsuario.findMany({
      where: { grupoId, usuario: { usuarioBaja: null } },
      select: membresiaSelect,
      orderBy: { usuario: { usuarioNombre: "asc" } },
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

  quitarUsuario(id: number) {
    return prisma.grupoUsuario.delete({
      where: { id },
    });
  },

  crearConAccesosYUsuarios(data: { grupoNombre: string; accesos: string[]; usuarios: number[] }) {
    return prisma.$transaction(async (tx) => {
      const grupo = await tx.grupo.create({
        data: { grupoNombre: data.grupoNombre },
        select: { id: true },
      });
      await tx.accesoGrupo.createMany({
        data: data.accesos.map((accesoId) => ({
          grupoId: grupo.id,
          accesoId,
          accesoGrupoValor: true,
        })),
      });
      await tx.grupoUsuario.createMany({
        data: data.usuarios.map((usuarioId) => ({ grupoId: grupo.id, usuarioId })),
      });
      const detalle = await tx.grupo.findFirstOrThrow({
        where: { id: grupo.id },
        select: grupoDetalleSelect,
      });
      return presentar(detalle);
    });
  },

  actualizarConAccesosYUsuarios(
    id: number,
    data: { grupoNombre: string; accesos: string[]; usuarios: number[] },
  ) {
    return prisma.$transaction(async (tx) => {
      await tx.grupo.update({
        where: { id },
        data: { grupoNombre: data.grupoNombre },
      });
      await tx.accesoGrupo.deleteMany({ where: { grupoId: id } });
      await tx.accesoGrupo.createMany({
        data: data.accesos.map((accesoId) => ({
          grupoId: id,
          accesoId,
          accesoGrupoValor: true,
        })),
      });
      await tx.grupoUsuario.deleteMany({
        where: { grupoId: id, usuarioId: { notIn: data.usuarios } },
      });
      const actuales = await tx.grupoUsuario.findMany({
        where: { grupoId: id },
        select: { usuarioId: true },
      });
      const yaEstan = new Set(actuales.map((fila) => fila.usuarioId));
      const nuevos = data.usuarios.filter((usuarioId) => !yaEstan.has(usuarioId));
      if (nuevos.length > 0) {
        await tx.grupoUsuario.createMany({
          data: nuevos.map((usuarioId) => ({ grupoId: id, usuarioId })),
        });
      }
      const detalle = await tx.grupo.findFirstOrThrow({
        where: { id },
        select: grupoDetalleSelect,
      });
      return presentar(detalle);
    });
  },
};
