import { z } from "zod";

export const loginSchema = z.object({
  usuarioMail: z.email("Ingresá un mail válido"),
  usuarioContrasenia: z.string("La contraseña es obligatoria").min(1, "La contraseña es obligatoria"),
});

export const olvideContrasenaSchema = z.object({
  usuarioMail: z.email("Ingresá un mail válido"),
});

export const recuperarContrasenaSchema = z.object({
  token: z.string().min(1, "El token es obligatorio"),
  usuarioContrasenia: z
    .string("La contraseña es obligatoria")
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type OlvideContrasenaInput = z.infer<typeof olvideContrasenaSchema>;
export type RecuperarContrasenaInput = z.infer<typeof recuperarContrasenaSchema>;
