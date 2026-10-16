import { z } from "zod";
import { maxNumeroComprobante, maxPuntoVenta } from "../../shared/formato-comprobante";

const textoOpcional = z.string().trim().min(1, "El texto no puede estar vacío").nullable();
const idOpcional = z.number().int().positive().nullable();

const puntoVenta = z
  .number()
  .int("El punto de venta tiene que ser un número entero")
  .positive("El punto de venta tiene que ser mayor a cero")
  .max(maxPuntoVenta(), `El punto de venta no puede tener más de 5 dígitos`);

const numeroComprobante = z
  .number()
  .int("El número tiene que ser un número entero")
  .positive("El número tiene que ser mayor a cero")
  .max(maxNumeroComprobante(), `El número no puede tener más de 8 dígitos`);

const itemConfirmadoSchema = z.object({
  comprobanteItemCant: z.number().int().positive("La cantidad tiene que ser mayor a cero"),
  productoTallesId: z.number().int().positive(),
  comprobanteItemDesc: textoOpcional.optional(),
  comprobanteItemIVA: z.number().min(0, "El IVA no puede ser negativo"),
  comprobanteItemTotal: z.number().min(0, "El total no puede ser negativo"),
});

const itemPendienteSchema = z.object({
  comprobanteItemCant: z.number().int().positive("La cantidad tiene que ser mayor a cero").nullable().optional(),
  productoTallesId: idOpcional.optional(),
  comprobanteItemDesc: textoOpcional.optional(),
  comprobanteItemIVA: z.number().min(0, "El IVA no puede ser negativo").nullable().optional(),
  comprobanteItemTotal: z.number().min(0, "El total no puede ser negativo").nullable().optional(),
});

const cabeceraPendiente = {
  comprobantePuntoVenta: puntoVenta.nullable().optional(),
  comprobanteNro: numeroComprobante.nullable().optional(),
  comprobanteTotal: z.number().min(0).nullable().optional(),
  comprobanteIVA: z.number().min(0).nullable().optional(),
  comprobanteJSON: textoOpcional.optional(),
  proveedorId: idOpcional.optional(),
  plataformaId: idOpcional.optional(),
};

export const crearComprobanteConfirmadoSchema = z.object({
  comprobantePuntoVenta: puntoVenta,
  comprobanteNro: numeroComprobante,
  comprobanteJSON: textoOpcional.optional(),
  proveedorId: idOpcional.optional(),
  plataformaId: idOpcional.optional(),
  items: z.array(itemConfirmadoSchema).min(1, "El comprobante tiene que tener ítems"),
});

export const crearComprobantePendienteSchema = z.object({
  ...cabeceraPendiente,
  items: z.array(itemPendienteSchema).optional(),
});

export const actualizarComprobanteSchema = z
  .object(cabeceraPendiente)
  .refine((data) => Object.keys(data).length > 0, { message: "No hay datos para modificar" });

export const crearItemSchema = itemPendienteSchema;

export const actualizarItemSchema = itemPendienteSchema.refine((data) => Object.keys(data).length > 0, {
  message: "No hay datos para modificar",
});

const digitosOpcional = z
  .string()
  .optional()
  .transform((value) => {
    if (value === undefined) return undefined;
    const digitos = value.replace(/\D/g, "").trim();
    return digitos.length > 0 ? digitos : undefined;
  });

const booleanoQuery = z
  .union([z.literal("true"), z.literal("false"), z.literal("1"), z.literal("0"), z.boolean()])
  .optional()
  .transform((value) => value === true || value === "true" || value === "1");

export const listarComprobanteSchema = z.object({
  puntoVenta: digitosOpcional,
  numero: digitosOpcional,
  tipo: z.coerce.number().int().positive().optional(),
  estado: z
    .union([
      z.literal(1),
      z.literal(2),
      z.literal("1"),
      z.literal("2"),
      z.literal("eliminados"),
    ])
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined;
      if (value === "eliminados") return "eliminados" as const;
      return Number(value) as 1 | 2;
    }),
  proveedorId: z.coerce.number().int().positive().optional(),
  plataformaId: z.coerce.number().int().positive().optional(),
  incluirOrigenesBaja: booleanoQuery,
});

export type ListarComprobanteFiltros = Partial<z.infer<typeof listarComprobanteSchema>>;

export const comprobanteIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const itemParamSchema = z.object({
  id: z.coerce.number().int().positive(),
  itemId: z.coerce.number().int().positive(),
});

export type CrearComprobanteConfirmadoInput = z.infer<typeof crearComprobanteConfirmadoSchema>;
export type CrearComprobantePendienteInput = z.infer<typeof crearComprobantePendienteSchema>;
export type ActualizarComprobanteInput = z.infer<typeof actualizarComprobanteSchema>;
export type CrearItemInput = z.infer<typeof crearItemSchema>;
export type ActualizarItemInput = z.infer<typeof actualizarItemSchema>;
