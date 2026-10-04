import { z } from "zod";

const textoOpcional = z.string().trim().min(1, "El texto no puede estar vacío").nullable();

export const crearProveedorSchema = z.object({
  proveedorRazonSocial: z.string().trim().min(1, "La razón social es obligatoria"),
  proveedorCUIT: z.string().trim().min(1, "El CUIT es obligatorio"),
  proveedorMail: z.email("Ingresá un mail válido"),
  proveedorParam: textoOpcional.optional(),
  proveedorCondIVA: z.number().int("La condición de IVA tiene que ser un número entero").nullable().optional(),
});

export const actualizarProveedorSchema = z
  .object({
    proveedorRazonSocial: z.string().trim().min(1, "La razón social es obligatoria").optional(),
    proveedorCUIT: z.string().trim().min(1, "El CUIT es obligatorio").optional(),
    proveedorMail: z.email("Ingresá un mail válido").optional(),
    proveedorParam: textoOpcional.optional(),
    proveedorCondIVA: z
      .number()
      .int("La condición de IVA tiene que ser un número entero")
      .nullable()
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "No hay datos para modificar",
  });

export const proveedorIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CrearProveedorInput = z.infer<typeof crearProveedorSchema>;
export type ActualizarProveedorInput = z.infer<typeof actualizarProveedorSchema>;
