import { z } from "zod";
import { mapeoContextoSchema } from "../../shared/mapeo-contexto";

/** 1 = Responsable inscripto, 2 = Monotributista */
const COND_IVA_RESPONSABLE_INSCRIPTO = 1;
const COND_IVA_MONOTRIBUTISTA = 2;

const proveedorCondIVA = z
  .union([
    z.literal(COND_IVA_RESPONSABLE_INSCRIPTO),
    z.literal(COND_IVA_MONOTRIBUTISTA),
    z.null(),
  ])
  .optional();

export const crearProveedorSchema = z.object({
  proveedorRazonSocial: z.string().trim().min(1, "La razón social es obligatoria"),
  proveedorCUIT: z.string().trim().min(1, "El CUIT es obligatorio"),
  proveedorMail: z.email("Ingresá un mail válido"),
  proveedorCondIVA,
  mapeo: mapeoContextoSchema.optional(),
});

export const actualizarProveedorSchema = z
  .object({
    proveedorRazonSocial: z.string().trim().min(1, "La razón social es obligatoria").optional(),
    proveedorCUIT: z.string().trim().min(1, "El CUIT es obligatorio").optional(),
    proveedorMail: z.email("Ingresá un mail válido").optional(),
    proveedorCondIVA,
    mapeo: mapeoContextoSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "No hay datos para modificar",
  });

export const proveedorIdParamSchema = z.object({
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

const condIvaFiltro = z
  .union([
    z.literal(COND_IVA_RESPONSABLE_INSCRIPTO),
    z.literal(COND_IVA_MONOTRIBUTISTA),
    z.literal("1"),
    z.literal("2"),
  ])
  .optional()
  .transform((value) => {
    if (value === undefined) return undefined;
    return Number(value) as 1 | 2;
  });

export const listarProveedorSchema = z.object({
  incluirBajas: booleanoQuery,
  razonSocial: textoFiltro,
  cuit: textoFiltro,
  mail: textoFiltro,
  condIva: condIvaFiltro,
});

export type CrearProveedorInput = z.infer<typeof crearProveedorSchema>;
export type ActualizarProveedorInput = z.infer<typeof actualizarProveedorSchema>;
export type ListarProveedorFiltros = Partial<z.infer<typeof listarProveedorSchema>>;
