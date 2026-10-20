import { createHash, randomBytes } from "node:crypto";
import { compare, hash } from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { AppError } from "../../shared/app-error";
import { enviarMail } from "../../shared/mailer";
import { seguridadRepository, type UsuarioConAccesos } from "./seguridad.repository";
import type { LoginInput, OlvideContrasenaInput, RecuperarContrasenaInput } from "./seguridad.schema";
import type { AccesoPermitido, Perfil, Sesion } from "./seguridad.types";

const JWT_EXPIRES_IN = "8h";
const TOKEN_EXPIRA_MS = 60 * 60 * 1000;
const MENSAJE_OLVIDE =
  "Si el correo está registrado, te enviamos un link para restablecer la contraseña.";

function hashearToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

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

  async olvideContrasena(input: OlvideContrasenaInput): Promise<{
    mensaje: string;
    previewUrl?: string;
    linkRecuperacion?: string;
  }> {
    const usuario = await seguridadRepository.findActivoByMail(input.usuarioMail.trim());

    if (!usuario) {
      return { mensaje: MENSAJE_OLVIDE };
    }

    const token = randomBytes(32).toString("hex");
    const tokenHash = hashearToken(token);
    const expira = new Date(Date.now() + TOKEN_EXPIRA_MS);

    await seguridadRepository.crearRecuperacion(usuario.id, tokenHash, expira);

    const linkRecuperacion = `${env.frontUrl}/recuperar-contrasena?token=${token}`;

    console.log("");
    console.log("=== Link de recuperación (demo local) ===");
    console.log(linkRecuperacion);
    console.log("=========================================");
    console.log("");

    const { previewUrl } = await enviarMail({
      para: usuario.usuarioMail,
      asunto: "Restablecé tu contraseña — LogIA",
      texto: `Hola ${usuario.usuarioNombre},\n\nPara restablecer tu contraseña abrí este link (válido 1 hora):\n${linkRecuperacion}\n\nSi no pediste esto, ignorá el mail.`,
      html: `
        <p>Hola <strong>${usuario.usuarioNombre}</strong>,</p>
        <p>Para restablecer tu contraseña hacé clic en el siguiente link (válido 1 hora):</p>
        <p><a href="${linkRecuperacion}">${linkRecuperacion}</a></p>
        <p>Si no pediste esto, ignorá el mail.</p>
      `,
    });

    return {
      mensaje: MENSAJE_OLVIDE,
      ...(previewUrl ? { previewUrl } : {}),
      linkRecuperacion,
    };
  },

  async recuperarContrasena(input: RecuperarContrasenaInput): Promise<{ mensaje: string }> {
    const tokenHash = hashearToken(input.token);
    const recuperacion = await seguridadRepository.findRecuperacionVigente(tokenHash);

    if (!recuperacion) {
      throw new AppError(400, "El link no es válido o ya expiró");
    }

    const usuarioContrasenia = await hash(input.usuarioContrasenia, 10);
    await seguridadRepository.marcarRecuperacionUsadaYCambiarClave(
      recuperacion.id,
      recuperacion.usuario.id,
      usuarioContrasenia,
    );

    return { mensaje: "Contraseña actualizada. Ya podés iniciar sesión." };
  },
};
