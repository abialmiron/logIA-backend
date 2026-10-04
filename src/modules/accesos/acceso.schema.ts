import { z } from "zod";

const codigoAcceso = z
  .string()
  .trim()
  .min(1, "El id es obligatorio")
  .max(50, "El id puede tener hasta 50 caracteres")
  .regex(/^[a-z0-9]+$/, "El id solo puede tener minúsculas y números");

export const crearAccesoSchema = z.object({
  id: codigoAcceso,
  accesoPadre: codigoAcceso.nullable().optional(),
  accesoOrden: z.number().int("El orden tiene que ser un número entero").optional(),
  accesoDescripcion: z.string().trim().min(1, "La descripción no puede estar vacía").optional(),
});

export type CrearAccesoInput = z.infer<typeof crearAccesoSchema>;
