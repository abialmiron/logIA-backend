import { AppError } from "../../shared/app-error";
import {
  mapeoDePlataforma,
  upsertMapeoPlataforma,
} from "../contextos-ia/contexto-ia.service";
import type {
  ActualizarPlataformaInput,
  CrearPlataformaInput,
  ListarPlataformaFiltros,
} from "./plataforma.schema";
import { plataformaRepository } from "./plataforma.repository";

export const plataformaService = {
  listar(filtros: ListarPlataformaFiltros = {}) {
    return plataformaRepository.listar(filtros);
  },

  async obtener(id: number) {
    const plataforma = await plataformaRepository.findActiva(id);
    if (!plataforma) {
      throw new AppError(404, "La plataforma no existe");
    }
    const mapeo = await mapeoDePlataforma(id);
    return { ...plataforma, mapeo };
  },

  async crear(input: CrearPlataformaInput) {
    const { mapeo: mapeoInput, ...datos } = input;
    const plataforma = await plataformaRepository.crear(datos);
    await upsertMapeoPlataforma(plataforma.id, mapeoInput ?? []);
    const mapeo = await mapeoDePlataforma(plataforma.id);
    return { ...plataforma, mapeo };
  },

  async actualizar(id: number, input: ActualizarPlataformaInput) {
    const plataforma = await plataformaRepository.findActiva(id);
    if (!plataforma) {
      throw new AppError(404, "La plataforma no existe");
    }
    const { mapeo: mapeoInput, ...datos } = input;
    const actualizada = await plataformaRepository.actualizar(id, datos);
    if (mapeoInput !== undefined) {
      await upsertMapeoPlataforma(id, mapeoInput);
    }
    const mapeo = await mapeoDePlataforma(id);
    return { ...actualizada, mapeo };
  },

  async darDeBaja(id: number) {
    const plataforma = await plataformaRepository.findActiva(id);
    if (!plataforma) {
      throw new AppError(404, "La plataforma no existe");
    }
    await plataformaRepository.darDeBaja(id);
  },
};
