export const COMPROBANTE_PENDIENTE = 1;
export const COMPROBANTE_CONFIRMADO = 2;

export const COMPROBANTE_TIPO_INGRESO = 1;
export const COMPROBANTE_TIPO_EGRESO = 2;

export function tipoDesdeOrigen(origen: {
  proveedorId: number | null;
  plataformaId: number | null;
}): number | null {
  if (origen.proveedorId != null) {
    return COMPROBANTE_TIPO_INGRESO;
  }
  if (origen.plataformaId != null) {
    return COMPROBANTE_TIPO_EGRESO;
  }
  return null;
}
