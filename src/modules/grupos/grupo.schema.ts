import { z } from "zod";

export const crearGrupoSchema = z.object({
  grupoNombre: z.string().trim().min(1, "El nombre es obligatorio"),
});

export const asignarUsuarioSchema = z.object({
  usuarioId: z.number().int("El usuario es obligatorio").positive("El usuario es obligatorio"),
});

export const grupoIdParamSchema = z.object({
  grupoId: z.coerce.number().int().positive(),
});

export type CrearGrupoInput = z.infer<typeof crearGrupoSchema>;
export type AsignarUsuarioInput = z.infer<typeof asignarUsuarioSchema>;
