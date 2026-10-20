import { z } from "zod";

const texto = z.string().trim().min(1, "El texto no puede estar vacío");

export const crearProductoSchema = z.object({
  productoNombre: texto,
  productoSKU: texto,
  proveedorId: z.number().int().positive(),
});

export const actualizarProductoSchema = z
  .object({
    productoNombre: texto.optional(),
    productoSKU: texto.optional(),
    proveedorId: z.number().int().positive().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: "No hay datos para modificar" });

export const crearTalleSchema = z.object({
  productoTalles: texto,
});

export const actualizarTalleSchema = crearTalleSchema;

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

export const listarProductoSchema = z.object({
  sku: textoFiltro,
  nombre: textoFiltro,
  proveedorId: z.coerce.number().int().positive().optional(),
});

export type CrearProductoInput = z.infer<typeof crearProductoSchema>;
export type ActualizarProductoInput = z.infer<typeof actualizarProductoSchema>;
export type CrearTalleInput = z.infer<typeof crearTalleSchema>;
export type ListarProductoFiltros = Partial<z.infer<typeof listarProductoSchema>>;
