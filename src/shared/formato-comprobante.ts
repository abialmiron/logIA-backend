export const LARGO_PUNTO_VENTA = 5;
export const LARGO_NUMERO = 8;

export function formatearPuntoVenta(valor: number | null | undefined): string | null {
  if (valor == null) return null;
  return String(valor).padStart(LARGO_PUNTO_VENTA, "0");
}

export function formatearNumeroComprobante(valor: number | null | undefined): string | null {
  if (valor == null) return null;
  return String(valor).padStart(LARGO_NUMERO, "0");
}

export function maxPuntoVenta() {
  return 10 ** LARGO_PUNTO_VENTA - 1;
}

export function maxNumeroComprobante() {
  return 10 ** LARGO_NUMERO - 1;
}
