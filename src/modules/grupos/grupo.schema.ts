import { z } from "zod";
import { codigoAcceso } from "../accesos/acceso.schema";

const grupoNombre = z.string().trim().min(1, "El nombre es obligatorio");

function sinRepetidos(mensaje: string) {
  return (ids: (string | number)[], ctx: z.RefinementCtx) => {
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({ code: "custom", message: mensaje });
    }
  };
}

export const guardarGrupoSchema = z.object({
  grupoNombre,
  accesos: z
    .array(codigoAcceso)
    .min(1, "Elegí al menos un acceso")
    .superRefine(sinRepetidos("Hay accesos repetidos")),
  usuarios: z
    .array(z.number().int().positive("El usuario es obligatorio"))
    .min(1, "Elegí al menos un usuario")
    .superRefine(sinRepetidos("Hay usuarios repetidos")),
});

export const crearGrupoSchema = guardarGrupoSchema;
export const actualizarGrupoSchema = guardarGrupoSchema;

export const asignarUsuarioSchema = z.object({
  usuarioId: z.number().int("El usuario es obligatorio").positive("El usuario es obligatorio"),
});

export const grupoIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const grupoUsuarioParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
  usuarioId: z.coerce.number().int().positive(),
});

export type GuardarGrupoInput = z.infer<typeof guardarGrupoSchema>;
export type CrearGrupoInput = GuardarGrupoInput;
export type ActualizarGrupoInput = GuardarGrupoInput;
export type AsignarUsuarioInput = z.infer<typeof asignarUsuarioSchema>;
