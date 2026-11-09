import { z } from "zod";
import { productoGeneroSchema } from "../productos/producto.schema";

const textoFiltro = z
  .string()
  .optional()
  .transform((value) => {
    if (value === undefined) return undefined;
    const texto = value.trim();
    return texto.length > 0 ? texto : undefined;
  });

export const listarStockSchema = z.object({
  productoId: z.coerce.number().int().positive().optional(),
  sku: textoFiltro,
  categoriaId: z.coerce.number().int().positive().optional(),
  genero: productoGeneroSchema.optional(),
});

export const stockTalleIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type ListarStockFiltros = Partial<z.infer<typeof listarStockSchema>>;
