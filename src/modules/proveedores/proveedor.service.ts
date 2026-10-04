import { AppError } from "../../shared/app-error";
import type { ActualizarProveedorInput, CrearProveedorInput } from "./proveedor.schema";
import { proveedorRepository } from "./proveedor.repository";

export const proveedorService = {
  listar() {
    return proveedorRepository.listar();
  },

  async obtener(id: number) {
    const proveedor = await proveedorRepository.findActivo(id);
    if (!proveedor) {
      throw new AppError(404, "El proveedor no existe");
    }
    return proveedor;
  },

  crear(input: CrearProveedorInput) {
    return proveedorRepository.crear(input);
  },

  async actualizar(id: number, input: ActualizarProveedorInput) {
    const proveedor = await proveedorRepository.findActivo(id);
    if (!proveedor) {
      throw new AppError(404, "El proveedor no existe");
    }
    return proveedorRepository.actualizar(id, input);
  },

  async darDeBaja(id: number) {
    const proveedor = await proveedorRepository.findActivo(id);
    if (!proveedor) {
      throw new AppError(404, "El proveedor no existe");
    }
    await proveedorRepository.darDeBaja(id);
  },
};
