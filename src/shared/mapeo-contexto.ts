import { z } from "zod";

export const parMapeoSchema = z.object({
  sistema: z
    .string()
    .trim()
    .min(1, "La palabra del sistema no puede estar vacía")
    .transform((value) => value.toUpperCase()),
  origen: z
    .string()
    .trim()
    .min(1, "La palabra del origen no puede estar vacía")
    .transform((value) => value.toUpperCase()),
});

export const mapeoContextoSchema = z.array(parMapeoSchema);

export type ParMapeo = z.infer<typeof parMapeoSchema>;

export function serializarMapeo(mapeo: ParMapeo[]) {
  if (mapeo.length === 0) return null;
  return JSON.stringify(mapeo);
}

export function parsearMapeo(mapeoCampo: string | null | undefined): ParMapeo[] {
  if (!mapeoCampo) return [];
  try {
    const crudo = JSON.parse(mapeoCampo) as unknown;
    const parseado = mapeoContextoSchema.safeParse(crudo);
    return parseado.success ? parseado.data : [];
  } catch {
    return [];
  }
}
