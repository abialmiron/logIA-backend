import { AppError } from "../../shared/app-error";
import type { ActualizarPlataformaInput, CrearPlataformaInput } from "./plataforma.schema";
import { plataformaRepository } from "./plataforma.repository";

export const plataformaService = {
  listar() {
    return plataformaRepository.listar();
  },

  async obtener(id: number) {
    const plataforma = await plataformaRepository.findActiva(id);
    if (!plataforma) {
      throw new AppError(404, "La plataforma no existe");
    }
    return plataforma;
  },

  crear(input: CrearPlataformaInput) {
    return plataformaRepository.crear(input);
  },

  async actualizar(id: number, input: ActualizarPlataformaInput) {
    const plataforma = await plataformaRepository.findActiva(id);
    if (!plataforma) {
      throw new AppError(404, "La plataforma no existe");
    }
    return plataformaRepository.actualizar(id, input);
  },

  async darDeBaja(id: number) {
    const plataforma = await plataformaRepository.findActiva(id);
    if (!plataforma) {
      throw new AppError(404, "La plataforma no existe");
    }
    await plataformaRepository.darDeBaja(id);
  },
};
