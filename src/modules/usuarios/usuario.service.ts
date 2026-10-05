import { hash } from "bcryptjs";
import { AppError } from "../../shared/app-error";
import { seguridadRepository } from "../seguridad/seguridad.repository";
import type { ActualizarUsuarioInput, CrearUsuarioInput } from "./usuario.schema";
import { usuarioRepository } from "./usuario.repository";

async function exigirPermisosSobreUsuario(actorId: number, usuarioId: number, mensaje: string) {
  const propios = new Set(await seguridadRepository.idsDeAccesos(actorId));
  const ajenos = await seguridadRepository.idsDeAccesos(usuarioId);
  if (ajenos.some((accesoId) => !propios.has(accesoId))) {
    throw new AppError(403, mensaje);
  }
}

export const usuarioService = {
  listar() {
    return usuarioRepository.listar();
  },

  async obtener(id: number) {
    const usuario = await usuarioRepository.findActivo(id);
    if (!usuario) {
      throw new AppError(404, "El usuario no existe");
    }
    return usuario;
  },

  async crear(input: CrearUsuarioInput) {
    const existente = await usuarioRepository.findByMail(input.usuarioMail);
    if (existente) {
      throw new AppError(409, "El mail ya está registrado");
    }

    const usuarioContrasenia = await hash(input.usuarioContrasenia, 10);
    return usuarioRepository.crear({
      usuarioNombre: input.usuarioNombre,
      usuarioMail: input.usuarioMail,
      usuarioContrasenia,
    });
  },

  async actualizar(id: number, input: ActualizarUsuarioInput, actorId: number) {
    const usuario = await usuarioRepository.findActivo(id);
    if (!usuario) {
      throw new AppError(404, "El usuario no existe");
    }

    await exigirPermisosSobreUsuario(
      actorId,
      id,
      "No podés modificar un usuario con permisos que vos no tenés",
    );

    const data: { usuarioNombre?: string; usuarioContrasenia?: string } = {};
    if (input.usuarioNombre !== undefined) {
      data.usuarioNombre = input.usuarioNombre;
    }
    if (input.usuarioContrasenia !== undefined) {
      data.usuarioContrasenia = await hash(input.usuarioContrasenia, 10);
    }

    return usuarioRepository.actualizar(id, data);
  },

  async darDeBaja(id: number, actorId: number) {
    if (id === actorId) {
      throw new AppError(400, "No podés darte de baja");
    }

    const usuario = await usuarioRepository.findActivo(id);
    if (!usuario) {
      throw new AppError(404, "El usuario no existe");
    }

    await exigirPermisosSobreUsuario(
      actorId,
      id,
      "No podés dar de baja un usuario con permisos que vos no tenés",
    );

    await usuarioRepository.darDeBaja(id);
  },
};
