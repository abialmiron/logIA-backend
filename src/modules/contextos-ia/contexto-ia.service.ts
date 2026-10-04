import { AppError } from "../../shared/app-error";
import { resolverOrigenComercial } from "../../shared/origen-comercial";
import { plataformaRepository } from "../plataformas/plataforma.repository";
import { proveedorRepository } from "../proveedores/proveedor.repository";
import type {
  ActualizarContextoIAInput,
  CrearContextoIAInput,
  ListarContextoIAQuery,
} from "./contexto-ia.schema";
import { contextoIARepository } from "./contexto-ia.repository";

async function exigirReferenciasActivas(input: {
  proveedorId?: number | null;
  plataformaId?: number | null;
}) {
  if (input.proveedorId) {
    const proveedor = await proveedorRepository.findActivo(input.proveedorId);
    if (!proveedor) {
      throw new AppError(400, "El proveedor no existe");
    }
  }

  if (input.plataformaId) {
    const plataforma = await plataformaRepository.findActiva(input.plataformaId);
    if (!plataforma) {
      throw new AppError(400, "La plataforma no existe");
    }
  }
}

function resumirContexto(contexto: {
  id: number;
  archivoEjemplo: string | null;
  mapeoCampo: string | null;
  aaasttem: string | null;
}) {
  return {
    id: contexto.id,
    archivoEjemplo: contexto.archivoEjemplo,
    mapeoCampo: contexto.mapeoCampo,
    aaasttem: contexto.aaasttem,
  };
}

export const contextoIAService = {
  listar(query: ListarContextoIAQuery) {
    return contextoIARepository.listar(query);
  },

  async obtener(id: number) {
    const contexto = await contextoIARepository.findById(id);
    if (!contexto) {
      throw new AppError(404, "El contexto no existe");
    }
    return contexto;
  },

  async porMail(mail: string) {
    const [plataformas, proveedores] = await Promise.all([
      plataformaRepository.findActivasPorMail(mail),
      proveedorRepository.findActivosPorMail(mail),
    ]);

    if (plataformas.length > 0 && proveedores.length > 0) {
      throw new AppError(409, "El mail corresponde a un proveedor y a una plataforma");
    }
    if (plataformas.length > 1) {
      throw new AppError(409, "Hay más de una plataforma con ese mail");
    }
    if (proveedores.length > 1) {
      throw new AppError(409, "Hay más de un proveedor con ese mail");
    }

    const sinContexto = new AppError(404, "No hay contexto para ese mail");

    if (plataformas.length === 1) {
      const plataforma = plataformas[0];
      const contextos = await contextoIARepository.listar({ plataformaId: plataforma.id });
      if (contextos.length === 0) {
        throw sinContexto;
      }
      return {
        mail: plataforma.plataformaMail,
        origen: "plataforma" as const,
        origenId: plataforma.id,
        origenNombre: plataforma.plataformaNombre,
        contextos: contextos.map(resumirContexto),
      };
    }

    if (proveedores.length === 1) {
      const proveedor = proveedores[0];
      const contextos = await contextoIARepository.listar({ proveedorId: proveedor.id });
      if (contextos.length === 0) {
        throw sinContexto;
      }
      return {
        mail: proveedor.proveedorMail,
        origen: "proveedor" as const,
        origenId: proveedor.id,
        origenNombre: proveedor.proveedorRazonSocial,
        contextos: contextos.map(resumirContexto),
      };
    }

    throw sinContexto;
  },

  async crear(input: CrearContextoIAInput) {
    const origen = resolverOrigenComercial(input);
    await exigirReferenciasActivas(origen);
    return contextoIARepository.crear({ ...input, ...origen });
  },

  async actualizar(id: number, input: ActualizarContextoIAInput) {
    const contexto = await contextoIARepository.findById(id);
    if (!contexto) {
      throw new AppError(404, "El contexto no existe");
    }

    const origen = resolverOrigenComercial(input, {
      proveedorId: contexto.proveedorId,
      plataformaId: contexto.plataformaId,
    });
    await exigirReferenciasActivas(origen);
    return contextoIARepository.actualizar(id, { ...input, ...origen });
  },

  async eliminar(id: number) {
    const contexto = await contextoIARepository.findById(id);
    if (!contexto) {
      throw new AppError(404, "El contexto no existe");
    }
    await contextoIARepository.eliminar(id);
  },
};
