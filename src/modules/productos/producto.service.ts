import { Prisma } from "../../../generated/prisma/client";
import { AppError } from "../../shared/app-error";
import { proveedorRepository } from "../proveedores/proveedor.repository";
import type {
  ActualizarProductoInput,
  CrearProductoInput,
  CrearTalleInput,
} from "./producto.schema";
import { productoRepository } from "./producto.repository";

async function exigirProveedor(proveedorId: number) {
  const proveedor = await proveedorRepository.findActivo(proveedorId);
  if (!proveedor) {
    throw new AppError(400, "El proveedor no existe");
  }
}

export const productoService = {
  listar() {
    return productoRepository.listar();
  },

  async obtener(id: number) {
    const producto = await productoRepository.findActivo(id);
    if (!producto) {
      throw new AppError(404, "El producto no existe");
    }
    return producto;
  },

  async crear(input: CrearProductoInput) {
    await exigirProveedor(input.proveedorId);
    return productoRepository.crear(input);
  },

  async actualizar(id: number, input: ActualizarProductoInput) {
    const producto = await productoRepository.findActivo(id);
    if (!producto) {
      throw new AppError(404, "El producto no existe");
    }
    if (input.proveedorId !== undefined) {
      await exigirProveedor(input.proveedorId);
    }
    return productoRepository.actualizar(id, input);
  },

  async darDeBaja(id: number) {
    const producto = await productoRepository.findActivo(id);
    if (!producto) {
      throw new AppError(404, "El producto no existe");
    }
    await productoRepository.darDeBaja(id);
  },

  async crearTalle(productoId: number, input: CrearTalleInput) {
    const producto = await productoRepository.findActivo(productoId);
    if (!producto) {
      throw new AppError(404, "El producto no existe");
    }
    return productoRepository.crearTalle(productoId, input.productoTalles);
  },

  async actualizarTalle(productoId: number, talleId: number, input: CrearTalleInput) {
    const talle = await productoRepository.findTalle(productoId, talleId);
    if (!talle) {
      throw new AppError(404, "El talle no existe");
    }
    return productoRepository.actualizarTalle(talleId, input.productoTalles);
  },

  async eliminarTalle(productoId: number, talleId: number) {
    const talle = await productoRepository.findTalle(productoId, talleId);
    if (!talle) {
      throw new AppError(404, "El talle no existe");
    }
    try {
      await productoRepository.eliminarTalle(talleId);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
        throw new AppError(409, "El talle está usado en stock o en un comprobante");
      }
      throw error;
    }
  },
};
