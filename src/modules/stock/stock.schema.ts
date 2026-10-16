import { z } from "zod";

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
});

export type ListarStockFiltros = Partial<z.infer<typeof listarStockSchema>>;
