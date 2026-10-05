import { AppError } from "../../shared/app-error";
import { accesoRepository } from "../accesos/acceso.repository";
import { usuarioRepository } from "../usuarios/usuario.repository";
import type { AsignarUsuarioInput, GuardarGrupoInput } from "./grupo.schema";
import { grupoRepository } from "./grupo.repository";

const USUARIO_ADMIN_MAIL = "admin@logia.com";

function esGrupoAdministrador(grupoNombre: string) {
  return grupoNombre.localeCompare("Administrador", "es", { sensitivity: "accent" }) === 0;
}

function mismosIds(actuales: string[], nuevos: string[]) {
  if (actuales.length !== nuevos.length) return false;
  const conjunto = new Set(actuales);
  return nuevos.every((id) => conjunto.has(id));
}

async function exigirConservaUsuarioAdmin(grupoId: number, usuarioIds: number[]) {
  const admin = await usuarioRepository.findByMail(USUARIO_ADMIN_MAIL);
  if (!admin) return;

  const membresia = await grupoRepository.findMembresia(grupoId, admin.id);
  if (membresia && !usuarioIds.includes(admin.id)) {
    throw new AppError(400, "No se puede sacar al usuario admin del grupo Administrador");
  }
}

async function grupoActivoConAccesos(grupoId: number) {
  const grupo = await grupoRepository.findActivoConAccesos(grupoId);
  if (!grupo) {
    throw new AppError(404, "El grupo no existe");
  }
  return grupo;
}

async function exigirAdministrador(actorId: number) {
  const administrador = await grupoRepository.esAdministrador(actorId);
  if (!administrador) {
    throw new AppError(403, "Solo un administrador puede hacer esto");
  }
}

async function validarAccesos(accesoIds: string[]) {
  const encontrados = await accesoRepository.findByIds(accesoIds);
  if (encontrados.length !== accesoIds.length) {
    throw new AppError(400, "Hay un acceso que no existe");
  }
}

async function validarUsuarios(usuarioIds: number[]) {
  const activos = await usuarioRepository.findActivosByIds(usuarioIds);
  if (activos.length !== usuarioIds.length) {
    throw new AppError(404, "El usuario no existe");
  }
}

export const grupoService = {
  listar() {
    return grupoRepository.listar();
  },

  async obtener(id: number) {
    const grupo = await grupoRepository.findDetalle(id);
    if (!grupo) {
      throw new AppError(404, "El grupo no existe");
    }
    return grupo;
  },

  async crear(input: GuardarGrupoInput, actorId: number) {
    await exigirAdministrador(actorId);
    await validarAccesos(input.accesos);
    await validarUsuarios(input.usuarios);
    return grupoRepository.crearConAccesosYUsuarios(input);
  },

  async actualizar(id: number, input: GuardarGrupoInput, actorId: number) {
    await exigirAdministrador(actorId);
    const actual = await grupoRepository.findDetalle(id);
    if (!actual) {
      throw new AppError(404, "El grupo no existe");
    }

    if (esGrupoAdministrador(actual.grupoNombre)) {
      if (!esGrupoAdministrador(input.grupoNombre)) {
        throw new AppError(400, "No se puede cambiar el nombre del grupo Administrador");
      }
      if (!mismosIds(actual.accesos.map((acceso) => acceso.id), input.accesos)) {
        throw new AppError(400, "No se pueden modificar los accesos del grupo Administrador");
      }
      await exigirConservaUsuarioAdmin(id, input.usuarios);
    }

    await validarAccesos(input.accesos);
    await validarUsuarios(input.usuarios);

    const membresia = await grupoRepository.findMembresia(id, actorId);
    if (membresia && !input.usuarios.includes(actorId)) {
      throw new AppError(400, "No podés sacarte del grupo");
    }

    return grupoRepository.actualizarConAccesosYUsuarios(id, input);
  },

  async darDeBaja(id: number, actorId: number) {
    await exigirAdministrador(actorId);
    await grupoActivoConAccesos(id);

    const membresia = await grupoRepository.findMembresia(id, actorId);
    if (membresia) {
      throw new AppError(400, "No podés dar de baja un grupo al que pertenecés");
    }

    await grupoRepository.darDeBaja(id);
  },

  async listarUsuarios(grupoId: number) {
    const grupo = await grupoRepository.findActivo(grupoId);
    if (!grupo) {
      throw new AppError(404, "El grupo no existe");
    }
    return grupoRepository.listarUsuarios(grupoId);
  },

  async asignarUsuario(grupoId: number, input: AsignarUsuarioInput, asignadoPor: number) {
    await exigirAdministrador(asignadoPor);
    const grupo = await grupoActivoConAccesos(grupoId);
    if (grupo.accesosGrupo.length === 0) {
      throw new AppError(400, "El grupo no tiene accesos");
    }

    const usuario = await usuarioRepository.findActivoById(input.usuarioId);
    if (!usuario) {
      throw new AppError(404, "El usuario no existe");
    }

    const membresia = await grupoRepository.findMembresia(grupoId, input.usuarioId);
    if (membresia) {
      throw new AppError(409, "El usuario ya está en el grupo");
    }

    return grupoRepository.asignarUsuario(grupoId, input.usuarioId);
  },

  async quitarUsuario(grupoId: number, usuarioId: number, actorId: number) {
    await exigirAdministrador(actorId);
    const grupo = await grupoRepository.findActivo(grupoId);
    if (!grupo) {
      throw new AppError(404, "El grupo no existe");
    }

    const membresia = await grupoRepository.findMembresia(grupoId, usuarioId);
    if (!membresia) {
      throw new AppError(404, "El usuario no está en el grupo");
    }

    if (esGrupoAdministrador(grupo.grupoNombre)) {
      const admin = await usuarioRepository.findByMail(USUARIO_ADMIN_MAIL);
      if (admin?.id === usuarioId) {
        throw new AppError(400, "No se puede sacar al usuario admin del grupo Administrador");
      }
    }

    if (usuarioId === actorId) {
      throw new AppError(400, "No podés sacarte del grupo");
    }

    const activo = await usuarioRepository.findActivoById(usuarioId);
    const cantidad = await grupoRepository.contarUsuariosActivos(grupoId);
    if (activo && cantidad <= 1) {
      throw new AppError(400, "El grupo tiene que tener al menos un usuario");
    }

    await grupoRepository.quitarUsuario(membresia.id);
  },
};
