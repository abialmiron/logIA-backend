import { z } from "zod";

const textoOpcional = z.string().trim().min(1, "El texto no puede estar vacío").nullable();

export const crearPlataformaSchema = z.object({
  plataformaNombre: z.string().trim().min(1, "El nombre es obligatorio"),
  plataformaMail: z.email("Ingresá un mail válido"),
  plataformaParam: textoOpcional.optional(),
});

export const actualizarPlataformaSchema = z
  .object({
    plataformaNombre: z.string().trim().min(1, "El nombre es obligatorio").optional(),
    plataformaMail: z.email("Ingresá un mail válido").optional(),
    plataformaParam: textoOpcional.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "No hay datos para modificar",
  });

export const plataformaIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CrearPlataformaInput = z.infer<typeof crearPlataformaSchema>;
export type ActualizarPlataformaInput = z.infer<typeof actualizarPlataformaSchema>;
