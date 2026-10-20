import { z } from "zod";
import { mapeoContextoSchema } from "../../shared/mapeo-contexto";

export const crearPlataformaSchema = z.object({
  plataformaNombre: z.string().trim().min(1, "El nombre es obligatorio"),
  plataformaMail: z.email("Ingresá un mail válido"),
  mapeo: mapeoContextoSchema.optional(),
});

export const actualizarPlataformaSchema = z
  .object({
    plataformaNombre: z.string().trim().min(1, "El nombre es obligatorio").optional(),
    plataformaMail: z.email("Ingresá un mail válido").optional(),
    mapeo: mapeoContextoSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "No hay datos para modificar",
  });

export const plataformaIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const textoFiltro = z
  .string()
  .optional()
  .transform((value) => {
    if (value === undefined) return undefined;
    const texto = value.trim();
    return texto.length > 0 ? texto : undefined;
  });

const booleanoQuery = z
  .union([z.literal("true"), z.literal("false"), z.literal("1"), z.literal("0"), z.boolean()])
  .optional()
  .transform((value) => value === true || value === "true" || value === "1");

export const listarPlataformaSchema = z.object({
  incluirBajas: booleanoQuery,
  nombre: textoFiltro,
  mail: textoFiltro,
});

export type CrearPlataformaInput = z.infer<typeof crearPlataformaSchema>;
export type ActualizarPlataformaInput = z.infer<typeof actualizarPlataformaSchema>;
export type ListarPlataformaFiltros = Partial<z.infer<typeof listarPlataformaSchema>>;
