import { z } from "zod";

const usuarioNombre = z.string().trim().min(1, "El nombre es obligatorio");
const usuarioContrasenia = z.string().min(8, "La contraseña debe tener al menos 8 caracteres");

export const crearUsuarioSchema = z.object({
  usuarioNombre,
  usuarioMail: z.email("Ingresá un mail válido"),
  usuarioContrasenia,
});

export const actualizarUsuarioSchema = z
  .object({
    usuarioNombre: usuarioNombre.optional(),
    usuarioContrasenia: usuarioContrasenia.optional(),
    usuarioMail: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.usuarioMail !== undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["usuarioMail"],
        message: "El mail no se puede modificar",
      });
      return;
    }

    if (data.usuarioNombre === undefined && data.usuarioContrasenia === undefined) {
      ctx.addIssue({
        code: "custom",
        message: "No hay datos para modificar",
      });
    }
  })
  .transform(({ usuarioNombre: nombre, usuarioContrasenia: contrasenia }) => {
    const data: { usuarioNombre?: string; usuarioContrasenia?: string } = {};
    if (nombre !== undefined) data.usuarioNombre = nombre;
    if (contrasenia !== undefined) data.usuarioContrasenia = contrasenia;
    return data;
  });

export const usuarioIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CrearUsuarioInput = z.infer<typeof crearUsuarioSchema>;
export type ActualizarUsuarioInput = z.infer<typeof actualizarUsuarioSchema>;
