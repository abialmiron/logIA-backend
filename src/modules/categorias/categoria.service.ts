import { Prisma } from "../../../generated/prisma/client";
import { AppError } from "../../shared/app-error";
import type {
  ActualizarCategoriaInput,
  CrearCategoriaInput,
  ListarCategoriaFiltros,
} from "./categoria.schema";
import { categoriaRepository, type CategoriaFila } from "./categoria.repository";

type CategoriaConProfundidad = CategoriaFila & { profundidad: number };

function ordenarEnArbol(categorias: CategoriaFila[]): CategoriaConProfundidad[] {
  const porPadre = new Map<number | null, CategoriaFila[]>();

  for (const categoria of categorias) {
    const clave = categoria.categoriaPadreId;
    const lista = porPadre.get(clave) ?? [];
    lista.push(categoria);
    porPadre.set(clave, lista);
  }

  for (const lista of porPadre.values()) {
    lista.sort((a, b) => a.categoriaNombre.localeCompare(b.categoriaNombre, "es"));
  }

  const resultado: CategoriaConProfundidad[] = [];

  function recorrer(padreId: number | null, profundidad: number) {
    for (const categoria of porPadre.get(padreId) ?? []) {
      resultado.push({ ...categoria, profundidad });
      recorrer(categoria.id, profundidad + 1);
    }
  }

  recorrer(null, 0);
  return resultado;
}

async function idsDescendientesIncluido(raizId: number) {
  const activas = await categoriaRepository.listarActivas();
  const hijosPorPadre = new Map<number | null, number[]>();

  for (const categoria of activas) {
    const lista = hijosPorPadre.get(categoria.categoriaPadreId) ?? [];
    lista.push(categoria.id);
    hijosPorPadre.set(categoria.categoriaPadreId, lista);
  }

  const ids: number[] = [];
  const cola = [raizId];

  while (cola.length > 0) {
    const id = cola.pop()!;
    ids.push(id);
    for (const hijo of hijosPorPadre.get(id) ?? []) {
      cola.push(hijo);
    }
  }

  return ids;
}

async function exigirPadre(padreId: number | null | undefined) {
  if (padreId === undefined || padreId === null) return null;
  const padre = await categoriaRepository.findActiva(padreId);
  if (!padre) {
    throw new AppError(400, "La categoría padre no existe");
  }
  return padreId;
}

async function exigirNombreLibre(padreId: number | null, nombre: string, excluirId?: number) {
  const existente = await categoriaRepository.findActivasPorPadreYNombre(padreId, nombre, excluirId);
  if (existente) {
    throw new AppError(409, "Ya existe una categoría con ese nombre en el mismo nivel");
  }
}

export const categoriaService = {
  async listar(filtros: ListarCategoriaFiltros = {}) {
    const filas = await categoriaRepository.listar(filtros);
    return ordenarEnArbol(filas);
  },

  async obtener(id: number) {
    const categoria = await categoriaRepository.findActiva(id);
    if (!categoria) {
      throw new AppError(404, "La categoría no existe");
    }
    return categoria;
  },

  async crear(input: CrearCategoriaInput) {
    const padreId = await exigirPadre(input.categoriaPadreId ?? null);
    await exigirNombreLibre(padreId, input.categoriaNombre);

    try {
      return await categoriaRepository.crear({
        categoriaNombre: input.categoriaNombre,
        categoriaPadreId: padreId,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new AppError(409, "Ya existe una categoría con ese nombre en el mismo nivel");
      }
      throw error;
    }
  },

  async actualizar(id: number, input: ActualizarCategoriaInput) {
    const categoria = await categoriaRepository.findActiva(id);
    if (!categoria) {
      throw new AppError(404, "La categoría no existe");
    }

    const padreId =
      input.categoriaPadreId !== undefined
        ? await exigirPadre(input.categoriaPadreId)
        : categoria.categoriaPadreId;

    if (padreId === id) {
      throw new AppError(400, "Una categoría no puede ser padre de sí misma");
    }

    if (padreId !== null && input.categoriaPadreId !== undefined) {
      const descendientes = await idsDescendientesIncluido(id);
      if (descendientes.includes(padreId)) {
        throw new AppError(400, "No se puede mover una categoría bajo una de sus subcategorías");
      }
    }

    const nombre = input.categoriaNombre ?? categoria.categoriaNombre;
    await exigirNombreLibre(padreId, nombre, id);

    try {
      return await categoriaRepository.actualizar(id, {
        ...(input.categoriaNombre !== undefined ? { categoriaNombre: input.categoriaNombre } : {}),
        ...(input.categoriaPadreId !== undefined ? { categoriaPadreId: padreId } : {}),
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new AppError(409, "Ya existe una categoría con ese nombre en el mismo nivel");
      }
      throw error;
    }
  },

  async darDeBaja(id: number) {
    const categoria = await categoriaRepository.findActiva(id);
    if (!categoria) {
      throw new AppError(404, "La categoría no existe");
    }

    const hijos = await categoriaRepository.contarHijosActivos(id);
    if (hijos > 0) {
      throw new AppError(409, "La categoría tiene subcategorías activas");
    }

    const productos = await categoriaRepository.contarProductosActivos(id);
    if (productos > 0) {
      throw new AppError(409, "La categoría tiene productos asociados");
    }

    await categoriaRepository.darDeBaja(id);
  },

  async reactivar(id: number) {
    const categoria = await categoriaRepository.findById(id);
    if (!categoria) {
      throw new AppError(404, "La categoría no existe");
    }
    if (categoria.categoriaBaja === null) {
      throw new AppError(400, "La categoría ya está activa");
    }

    if (categoria.categoriaPadreId !== null) {
      const padre = await categoriaRepository.findActiva(categoria.categoriaPadreId);
      if (!padre) {
        throw new AppError(409, "La categoría padre está dada de baja");
      }
    }

    await exigirNombreLibre(categoria.categoriaPadreId, categoria.categoriaNombre, id);
    return categoriaRepository.reactivar(id);
  },

  idsConDescendientes(raizId: number) {
    return idsDescendientesIncluido(raizId);
  },
};
