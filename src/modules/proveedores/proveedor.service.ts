import { AppError } from "../../shared/app-error";
import {
  mapeoDeProveedor,
  upsertMapeoProveedor,
} from "../contextos-ia/contexto-ia.service";
import type {
  ActualizarProveedorInput,
  CrearProveedorInput,
  ListarProveedorFiltros,
} from "./proveedor.schema";
import { proveedorRepository } from "./proveedor.repository";

export const proveedorService = {
  listar(filtros: ListarProveedorFiltros = {}) {
    return proveedorRepository.listar(filtros);
  },

  async obtener(id: number) {
    const proveedor = await proveedorRepository.findActivo(id);
    if (!proveedor) {
      throw new AppError(404, "El proveedor no existe");
    }
    const mapeo = await mapeoDeProveedor(id);
    return { ...proveedor, mapeo };
  },

  async crear(input: CrearProveedorInput) {
    const { mapeo: mapeoInput, ...datos } = input;
    const proveedor = await proveedorRepository.crear(datos);
    await upsertMapeoProveedor(proveedor.id, mapeoInput ?? []);
    const mapeo = await mapeoDeProveedor(proveedor.id);
    return { ...proveedor, mapeo };
  },

  async actualizar(id: number, input: ActualizarProveedorInput) {
    const proveedor = await proveedorRepository.findActivo(id);
    if (!proveedor) {
      throw new AppError(404, "El proveedor no existe");
    }
    const { mapeo: mapeoInput, ...datos } = input;
    const actualizado = await proveedorRepository.actualizar(id, datos);
    if (mapeoInput !== undefined) {
      await upsertMapeoProveedor(id, mapeoInput);
    }
    const mapeo = await mapeoDeProveedor(id);
    return { ...actualizado, mapeo };
  },

  async darDeBaja(id: number) {
    const proveedor = await proveedorRepository.findActivo(id);
    if (!proveedor) {
      throw new AppError(404, "El proveedor no existe");
    }
    await proveedorRepository.darDeBaja(id);
  },
};
