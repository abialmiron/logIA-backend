import { Prisma } from "../../../generated/prisma/client";
import { AppError } from "../../shared/app-error";
import { mapaCategoriasParaRuta, rutaCategoriaConComas } from "../categorias/categoria-ruta";
import { categoriaRepository } from "../categorias/categoria.repository";
import { categoriaService } from "../categorias/categoria.service";
import { plataformaRepository } from "../plataformas/plataforma.repository";
import { proveedorRepository } from "../proveedores/proveedor.repository";
import type {
  ActualizarProductoInput,
  ActualizarTalleInput,
  CrearProductoInput,
  CrearTalleInput,
  ListarProductoFiltros,
} from "./producto.schema";
import { productoRepository } from "./producto.repository";

async function exigirProveedor(proveedorId: number) {
  const proveedor = await proveedorRepository.findActivo(proveedorId);
  if (!proveedor) {
    throw new AppError(400, "El proveedor no existe");
  }
}

async function exigirCategoriaHoja(categoriaId: number) {
  const categoria = await categoriaRepository.findActiva(categoriaId);
  if (!categoria) {
    throw new AppError(400, "La categoría no existe");
  }

  const hijos = await categoriaRepository.contarHijosActivos(categoriaId);
  if (hijos > 0) {
    throw new AppError(400, "Debés elegir la categoría más específica");
  }
}

async function exigirPlataformas(plataformasIds: number[]) {
  const unicos = [...new Set(plataformasIds)];
  for (const plataformaId of unicos) {
    const plataforma = await plataformaRepository.findActiva(plataformaId);
    if (!plataforma) {
      throw new AppError(400, "Hay una plataforma inválida o dada de baja");
    }
  }
  return unicos;
}

export const productoService = {
  async listar(filtros: ListarProductoFiltros = {}) {
    let categoriaIds: number[] | undefined;
    if (filtros.categoriaId !== undefined) {
      categoriaIds = await categoriaService.idsConDescendientes(filtros.categoriaId);
    }
    const [productos, porId] = await Promise.all([
      productoRepository.listar(filtros, categoriaIds),
      mapaCategoriasParaRuta(),
    ]);
    return productos.map((producto) => ({
      ...producto,
      categoria: {
        ...producto.categoria,
        categoriaNombre: rutaCategoriaConComas(producto.categoriaId, porId),
      },
    }));
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
    await exigirCategoriaHoja(input.categoriaId);
    const plataformasIds = input.plataformasIds
      ? await exigirPlataformas(input.plataformasIds)
      : [];

    const { plataformasIds: _omitidas, ...datos } = input;
    const creado = await productoRepository.crear(datos);
    if (plataformasIds.length === 0) return creado;
    return (await productoRepository.reemplazarPlataformas(creado.id, plataformasIds)) ?? creado;
  },

  async actualizar(id: number, input: ActualizarProductoInput) {
    const producto = await productoRepository.findActivo(id);
    if (!producto) {
      throw new AppError(404, "El producto no existe");
    }
    if (input.proveedorId !== undefined) {
      await exigirProveedor(input.proveedorId);
    }
    if (input.categoriaId !== undefined) {
      await exigirCategoriaHoja(input.categoriaId);
    }

    const { plataformasIds, ...datos } = input;
    let actualizado = producto;
    if (Object.keys(datos).length > 0) {
      actualizado = await productoRepository.actualizar(id, datos);
    }

    if (plataformasIds !== undefined) {
      const ids = await exigirPlataformas(plataformasIds);
      actualizado = (await productoRepository.reemplazarPlataformas(id, ids)) ?? actualizado;
    }

    return actualizado;
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
    return productoRepository.crearTalle(productoId, input);
  },

  async actualizarTalle(productoId: number, talleId: number, input: ActualizarTalleInput) {
    const talle = await productoRepository.findTalle(productoId, talleId);
    if (!talle) {
      throw new AppError(404, "El talle no existe");
    }
    return productoRepository.actualizarTalle(talleId, input);
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
