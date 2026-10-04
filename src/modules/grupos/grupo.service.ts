import { AppError } from "../../shared/app-error";
import { seguridadRepository } from "../seguridad/seguridad.repository";
import { usuarioRepository } from "../usuarios/usuario.repository";
import type { AsignarUsuarioInput, CrearGrupoInput } from "./grupo.schema";
import { grupoRepository } from "./grupo.repository";

export const grupoService = {
  crear(input: CrearGrupoInput) {
    return grupoRepository.crear(input.grupoNombre);
  },

  async asignarUsuario(grupoId: number, input: AsignarUsuarioInput, asignadoPor: number) {
    const grupo = await grupoRepository.findActivoConAccesos(grupoId);
    if (!grupo) {
      throw new AppError(404, "El grupo no existe");
    }

    const accesosDelGrupo = grupo.accesosGrupo.map((acceso) => acceso.accesoId);
    if (accesosDelGrupo.length === 0) {
      throw new AppError(400, "El grupo no tiene accesos");
    }

    const usuario = await usuarioRepository.findActivoById(input.usuarioId);
    if (!usuario) {
      throw new AppError(404, "El usuario no existe");
    }

    const accesosDeQuienAsigna = new Set(await seguridadRepository.idsDeAccesos(asignadoPor));
    const excede = accesosDelGrupo.some((accesoId) => !accesosDeQuienAsigna.has(accesoId));
    if (excede) {
      throw new AppError(403, "No podés asignar un grupo con permisos que vos no tenés");
    }

    const membresia = await grupoRepository.findMembresia(grupoId, input.usuarioId);
    if (membresia) {
      throw new AppError(409, "El usuario ya está en el grupo");
    }

    return grupoRepository.asignarUsuario(grupoId, input.usuarioId);
  },
};
