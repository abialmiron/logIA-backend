import { z } from "zod";

const textoOpcional = z.string().trim().min(1, "El texto no puede estar vacío").nullable();
const idOpcional = z.number().int().positive().nullable();

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
  comprobantePuntoVenta: z.number().int().positive().nullable().optional(),
  comprobanteNro: z.number().int().positive().nullable().optional(),
  comprobanteTotal: z.number().min(0).nullable().optional(),
  comprobanteIVA: z.number().min(0).nullable().optional(),
  comprobante3SON: textoOpcional.optional(),
  proveedorId: idOpcional.optional(),
  plataformaId: idOpcional.optional(),
};

export const crearComprobanteConfirmadoSchema = z.object({
  comprobantePuntoVenta: z.number().int().positive(),
  comprobanteNro: z.number().int().positive(),
  comprobante3SON: textoOpcional.optional(),
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

export const listarComprobanteSchema = z.object({
  estado: z
    .union([z.literal(1), z.literal(2), z.literal("1"), z.literal("2")])
    .optional()
    .transform((value) => (value === undefined ? undefined : Number(value))),
});

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
