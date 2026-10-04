import { hash } from "bcryptjs";
import { AppError } from "../../shared/app-error";
import type { CrearUsuarioInput } from "./usuario.schema";
import { usuarioRepository } from "./usuario.repository";

export const usuarioService = {
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
};
