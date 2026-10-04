import { z } from "zod";

const textoOpcional = z.string().trim().min(1, "El texto no puede estar vacío").nullable();
const idOpcional = z.number().int().positive().nullable();

export const crearContextoIASchema = z.object({
  proveedorId: idOpcional.optional(),
  plataformaId: idOpcional.optional(),
  archivoEjemplo: textoOpcional.optional(),
  mapeoCampo: textoOpcional.optional(),
  aaasttem: textoOpcional.optional(),
});

export const actualizarContextoIASchema = z
  .object({
    proveedorId: idOpcional.optional(),
    plataformaId: idOpcional.optional(),
    archivoEjemplo: textoOpcional.optional(),
    mapeoCampo: textoOpcional.optional(),
    aaasttem: textoOpcional.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "No hay datos para modificar",
  });

export const listarContextoIASchema = z.object({
  proveedorId: z.coerce.number().int().positive().optional(),
  plataformaId: z.coerce.number().int().positive().optional(),
});

export const contextoIAIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CrearContextoIAInput = z.infer<typeof crearContextoIASchema>;
export type ActualizarContextoIAInput = z.infer<typeof actualizarContextoIASchema>;
export type ListarContextoIAQuery = z.infer<typeof listarContextoIASchema>;
