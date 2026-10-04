import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { AppError } from "../../shared/app-error";
import { seguridadRepository, type UsuarioConAccesos } from "./seguridad.repository";
import type { LoginInput } from "./seguridad.schema";
import type { AccesoPermitido, Perfil, Sesion } from "./seguridad.types";

const JWT_EXPIRES_IN = "8h";

function accesosPermitidos(usuario: UsuarioConAccesos): AccesoPermitido[] {
  const porId = new Map<string, AccesoPermitido>();

  for (const relacion of usuario.grupoUsuarios) {
    for (const accesoGrupo of relacion.grupo.accesosGrupo) {
      const acceso = accesoGrupo.acceso;
      porId.set(acceso.id, {
        id: acceso.id,
        accesoPadre: acceso.accesoPadre,
        accesoOrden: acceso.accesoOrden,
        accesoDescripcion: acceso.accesoDescripcion,
      });
    }
  }

  return [...porId.values()].sort((a, b) => {
    const ordenA = a.accesoOrden ?? Number.MAX_SAFE_INTEGER;
    const ordenB = b.accesoOrden ?? Number.MAX_SAFE_INTEGER;
    if (ordenA !== ordenB) return ordenA - ordenB;
    return a.id.localeCompare(b.id);
  });
}

function perfilDe(usuario: UsuarioConAccesos): Perfil {
  return {
    usuario: {
      id: usuario.id,
      usuarioNombre: usuario.usuarioNombre,
      usuarioMail: usuario.usuarioMail,
    },
    accesos: accesosPermitidos(usuario),
  };
}

function firmarToken(usuarioId: number): string {
  return jwt.sign({ sub: String(usuarioId) }, env.jwtSecret, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export const seguridadService = {
  async login(input: LoginInput): Promise<Sesion> {
    const usuario = await seguridadRepository.findByMailConAccesos(input.usuarioMail);
    const credencialesInvalidas = new AppError(401, "Credenciales inválidas");

    if (!usuario || usuario.usuarioBaja) {
      throw credencialesInvalidas;
    }

    const coincide = await compare(input.usuarioContrasenia, usuario.usuarioContrasenia).catch(
      () => false,
    );
    if (!coincide) {
      throw credencialesInvalidas;
    }

    return {
      token: firmarToken(usuario.id),
      ...perfilDe(usuario),
    };
  },

  async perfil(usuarioId: number): Promise<Perfil> {
    const usuario = await seguridadRepository.findActivoConAccesos(usuarioId);
    if (!usuario) {
      throw new AppError(401, "Sesión inválida");
    }
    return perfilDe(usuario);
  },
};
