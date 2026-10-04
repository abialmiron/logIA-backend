import { AppError } from "./app-error";

export type OrigenComercial = {
  proveedorId: number | null;
  plataformaId: number | null;
};

const vacio: OrigenComercial = { proveedorId: null, plataformaId: null };

export function resolverOrigenComercial(
  cambio: { proveedorId?: number | null; plataformaId?: number | null },
  actual: OrigenComercial = vacio,
): OrigenComercial {
  const enviaProveedor = cambio.proveedorId != null;
  const enviaPlataforma = cambio.plataformaId != null;

  if (enviaProveedor && enviaPlataforma) {
    throw new AppError(400, "El registro es de un proveedor o de una plataforma, no de los dos");
  }

  let proveedorId = cambio.proveedorId !== undefined ? cambio.proveedorId : actual.proveedorId;
  let plataformaId = cambio.plataformaId !== undefined ? cambio.plataformaId : actual.plataformaId;

  if (enviaProveedor) {
    plataformaId = null;
  }
  if (enviaPlataforma) {
    proveedorId = null;
  }

  if (proveedorId == null && plataformaId == null) {
    throw new AppError(400, "Indicá un proveedor o una plataforma");
  }

  return { proveedorId, plataformaId };
}
