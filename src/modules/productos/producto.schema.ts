import { z } from "zod";

const texto = z.string().trim().min(1, "El texto no puede estar vacío");

export const GENEROS_PRODUCTO = ["masculino", "femenino", "unisex"] as const;

export const productoGeneroSchema = z.enum(GENEROS_PRODUCTO, {
  message: "El género no es válido",
});

const plataformasIds = z.array(z.number().int().positive()).optional();

const productoTallesAlerta = z.number().int().nonnegative().nullable().optional();

export const crearProductoSchema = z.object({
  productoNombre: texto,
  productoSKU: texto,
  productoGenero: productoGeneroSchema,
  proveedorId: z.number().int().positive(),
  categoriaId: z.number().int().positive(),
  plataformasIds,
});

export const actualizarProductoSchema = z
  .object({
    productoNombre: texto.optional(),
    productoSKU: texto.optional(),
    productoGenero: productoGeneroSchema.optional(),
    proveedorId: z.number().int().positive().optional(),
    categoriaId: z.number().int().positive().optional(),
    plataformasIds,
  })
  .refine((data) => Object.keys(data).length > 0, { message: "No hay datos para modificar" });

export const crearTalleSchema = z.object({
  productoTalles: texto,
  productoTallesAlerta,
});

export const actualizarTalleSchema = z
  .object({
    productoTalles: texto.optional(),
    productoTallesAlerta,
  })
  .refine((data) => Object.keys(data).length > 0, { message: "No hay datos para modificar" });

export const productoIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const talleParamSchema = z.object({
  id: z.coerce.number().int().positive(),
  talleId: z.coerce.number().int().positive(),
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

export const listarProductoSchema = z.object({
  sku: textoFiltro,
  nombre: textoFiltro,
  proveedorId: z.coerce.number().int().positive().optional(),
  plataformaId: z.coerce.number().int().positive().optional(),
  categoriaId: z.coerce.number().int().positive().optional(),
  genero: productoGeneroSchema.optional(),
  soloConStock: booleanoQuery,
});

export type CrearProductoInput = z.infer<typeof crearProductoSchema>;
export type ActualizarProductoInput = z.infer<typeof actualizarProductoSchema>;
export type CrearTalleInput = z.infer<typeof crearTalleSchema>;
export type ActualizarTalleInput = z.infer<typeof actualizarTalleSchema>;
export type ListarProductoFiltros = Partial<z.infer<typeof listarProductoSchema>>;
