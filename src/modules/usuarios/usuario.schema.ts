import { z } from "zod";

export const crearUsuarioSchema = z.object({
  usuarioNombre: z.string().trim().min(1, "El nombre es obligatorio"),
  usuarioMail: z.email("Ingresá un mail válido"),
  usuarioContrasenia: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export type CrearUsuarioInput = z.infer<typeof crearUsuarioSchema>;
