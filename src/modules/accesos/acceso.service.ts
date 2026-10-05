import { AppError } from "../../shared/app-error";
import type { CrearAccesoInput } from "./acceso.schema";
import { accesoRepository } from "./acceso.repository";

export const accesoService = {
  listar() {
    return accesoRepository.listar();
  },

  async crear(input: CrearAccesoInput) {
    const existente = await accesoRepository.findById(input.id);
    if (existente) {
      throw new AppError(409, "El acceso ya existe");
    }

    if (input.accesoPadre) {
      const padre = await accesoRepository.findById(input.accesoPadre);
      if (!padre) {
        throw new AppError(400, "El acceso padre no existe");
      }
    }

    return accesoRepository.crear({
      id: input.id,
      accesoPadre: input.accesoPadre,
      accesoOrden: input.accesoOrden,
      accesoDescripcion: input.accesoDescripcion,
    });
  },
};
