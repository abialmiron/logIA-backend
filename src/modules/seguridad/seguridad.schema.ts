import { z } from "zod";

export const loginSchema = z.object({
  usuarioMail: z.email("Ingresá un mail válido"),
  usuarioContrasenia: z.string("La contraseña es obligatoria").min(1, "La contraseña es obligatoria"),
});

export type LoginInput = z.infer<typeof loginSchema>;
