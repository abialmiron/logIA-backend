import { z } from "zod";

const texto = z.string().trim().min(1, "El nombre es obligatorio");

const padreId = z.union([z.number().int().positive(), z.null()]).optional();

export const crearCategoriaSchema = z.object({
  categoriaNombre: texto,
  categoriaPadreId: padreId,
});

export const actualizarCategoriaSchema = z
  .object({
    categoriaNombre: texto.optional(),
    categoriaPadreId: padreId,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "No hay datos para modificar",
  });

export const categoriaIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const booleanoQuery = z
  .union([z.literal("true"), z.literal("false"), z.literal("1"), z.literal("0"), z.boolean()])
  .optional()
  .transform((value) => value === true || value === "true" || value === "1");

export const listarCategoriaSchema = z.object({
  incluirBajas: booleanoQuery,
});

export type CrearCategoriaInput = z.infer<typeof crearCategoriaSchema>;
export type ActualizarCategoriaInput = z.infer<typeof actualizarCategoriaSchema>;
export type ListarCategoriaFiltros = Partial<z.infer<typeof listarCategoriaSchema>>;
