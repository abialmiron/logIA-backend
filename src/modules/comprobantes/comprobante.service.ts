import { AppError } from "../../shared/app-error";
import {
  COMPROBANTE_CONFIRMADO,
  COMPROBANTE_PENDIENTE,
  tipoDesdeOrigen,
} from "../../shared/comprobante";
import { resolverOrigenComercial } from "../../shared/origen-comercial";
import { prisma } from "../../shared/prisma";
import { plataformaRepository } from "../plataformas/plataforma.repository";
import { productoRepository } from "../productos/producto.repository";
import { proveedorRepository } from "../proveedores/proveedor.repository";
import { stockRepository, type Tx } from "../stock/stock.repository";
import type {
  ActualizarComprobanteInput,
  ActualizarItemInput,
  CrearComprobanteConfirmadoInput,
  CrearComprobantePendienteInput,
  CrearItemInput,
} from "./comprobante.schema";
import { comprobanteRepository } from "./comprobante.repository";

type ItemGuardado = {
  comprobanteItemCant: number | null;
  productoTallesId: number | null;
  comprobanteItemIVA: number | null;
  comprobanteItemTotal: number | null;
};

function totalesDe(items: ItemGuardado[]) {
  return {
    comprobanteTotal: items.reduce((suma, item) => suma + (item.comprobanteItemTotal ?? 0), 0),
    comprobanteIVA: items.reduce((suma, item) => suma + (item.comprobanteItemIVA ?? 0), 0),
  };
}

function exigirCompleto(comprobante: {
  comprobantePuntoVenta: number | null;
  comprobanteNro: number | null;
  items: ItemGuardado[];
}) {
  if (comprobante.comprobantePuntoVenta == null || comprobante.comprobanteNro == null) {
    throw new AppError(400, "Faltan el punto de venta o el número");
  }
  if (comprobante.items.length === 0) {
    throw new AppError(400, "El comprobante no tiene ítems");
  }
  for (const item of comprobante.items) {
    if (item.productoTallesId == null) {
      throw new AppError(400, "Hay un ítem sin talle");
    }
    if (item.comprobanteItemCant == null || item.comprobanteItemCant <= 0) {
      throw new AppError(400, "Hay un ítem sin cantidad");
    }
    if (item.comprobanteItemIVA == null || item.comprobanteItemTotal == null) {
      throw new AppError(400, "Hay un ítem sin importes");
    }
  }
}

async function exigirOrigenActivo(tx: Tx, proveedorId: number | null, plataformaId: number | null) {
  if (proveedorId != null) {
    const proveedor = await tx.proveedor.findFirst({
      where: { id: proveedorId, proveedorBaja: null },
      select: { id: true },
    });
    if (!proveedor) {
      throw new AppError(400, "El proveedor no existe");
    }
  }
  if (plataformaId != null) {
    const plataforma = await tx.plataforma.findFirst({
      where: { id: plataformaId, plataformaBaja: null },
      select: { id: true },
    });
    if (!plataforma) {
      throw new AppError(400, "La plataforma no existe");
    }
  }
}

async function moverStock(tx: Tx, tipo: number, items: ItemGuardado[]) {
  for (const item of items) {
    await stockRepository.aplicarMovimiento(
      tx,
      item.productoTallesId as number,
      item.comprobanteItemCant as number,
      tipo,
    );
  }
}

async function exigirTalleSiViene(productoTallesId: number | null | undefined) {
  if (productoTallesId == null) {
    return;
  }
  const talle = await productoRepository.findTalleActivo(productoTallesId);
  if (!talle) {
    throw new AppError(400, "El talle no existe");
  }
}

export const comprobanteService = {
  listar(estado?: number) {
    return comprobanteRepository.listar(estado);
  },

  async obtener(id: number) {
    const comprobante = await comprobanteRepository.findById(id);
    if (!comprobante) {
      throw new AppError(404, "El comprobante no existe");
    }
    return comprobante;
  },

  async crearConfirmado(input: CrearComprobanteConfirmadoInput) {
    const origen = resolverOrigenComercial(input);
    if (input.proveedorId) {
      await exigirProveedorActivo(origen.proveedorId);
    }
    if (input.plataformaId) {
      await exigirPlataformaActiva(origen.plataformaId);
    }

    return prisma.$transaction(async (tx) => {
      await exigirOrigenActivo(tx, origen.proveedorId, origen.plataformaId);
      const totales = totalesDe(input.items);
      const tipo = tipoDesdeOrigen(origen) as number;
      const creado = await comprobanteRepository.crear(
        {
          comprobantePuntoVenta: input.comprobantePuntoVenta,
          comprobanteNro: input.comprobanteNro,
          comprobanteTipo: tipo,
          comprobanteEstado: COMPROBANTE_CONFIRMADO,
          comprobanteTotal: totales.comprobanteTotal,
          comprobanteIVA: totales.comprobanteIVA,
          comprobante3SON: input.comprobante3SON,
          proveedorId: origen.proveedorId,
          plataformaId: origen.plataformaId,
        },
        tx,
      );

      for (const item of input.items) {
        await comprobanteRepository.crearItem(
          {
            comprobanteId: creado.id,
            comprobanteItemCant: item.comprobanteItemCant,
            productoTallesId: item.productoTallesId,
            comprobanteItemDesc: item.comprobanteItemDesc,
            comprobanteItemIVA: item.comprobanteItemIVA,
            comprobanteItemTotal: item.comprobanteItemTotal,
          },
          tx,
        );
        await stockRepository.aplicarMovimiento(
          tx,
          item.productoTallesId,
          item.comprobanteItemCant,
          tipo,
        );
      }

      return comprobanteRepository.findById(creado.id, tx);
    });
  },

  async crearPendiente(input: CrearComprobantePendienteInput) {
    const origen = resolverOrigenComercial(input, undefined, { obligatorio: false });
    await exigirProveedorActivo(origen.proveedorId);
    await exigirPlataformaActiva(origen.plataformaId);
    for (const item of input.items ?? []) {
      await exigirTalleSiViene(item.productoTallesId);
    }

    return prisma.$transaction(async (tx) => {
      const creado = await comprobanteRepository.crear(
        {
          comprobantePuntoVenta: input.comprobantePuntoVenta,
          comprobanteNro: input.comprobanteNro,
          comprobanteTipo: tipoDesdeOrigen(origen),
          comprobanteEstado: COMPROBANTE_PENDIENTE,
          comprobanteTotal: input.comprobanteTotal,
          comprobanteIVA: input.comprobanteIVA,
          comprobante3SON: input.comprobante3SON,
          proveedorId: origen.proveedorId,
          plataformaId: origen.plataformaId,
        },
        tx,
      );

      for (const item of input.items ?? []) {
        await comprobanteRepository.crearItem({ comprobanteId: creado.id, ...item }, tx);
      }

      return comprobanteRepository.findById(creado.id, tx);
    });
  },

  async actualizar(id: number, input: ActualizarComprobanteInput) {
    const actual = await this.obtenerPendiente(id);
    const origen = resolverOrigenComercial(input, actual, { obligatorio: false });
    await exigirProveedorActivo(origen.proveedorId);
    await exigirPlataformaActiva(origen.plataformaId);

    return comprobanteRepository.actualizar(id, {
      ...input,
      comprobanteTipo: tipoDesdeOrigen(origen),
      proveedorId: origen.proveedorId,
      plataformaId: origen.plataformaId,
    });
  },

  async confirmar(id: number) {
    return prisma.$transaction(async (tx) => {
      const comprobante = await comprobanteRepository.findById(id, tx);
      if (!comprobante) {
        throw new AppError(404, "El comprobante no existe");
      }
      if (comprobante.comprobanteEstado !== COMPROBANTE_PENDIENTE) {
        throw new AppError(400, "El comprobante ya está confirmado");
      }

      exigirCompleto(comprobante);
      const origen = resolverOrigenComercial(comprobante);
      const tipo = tipoDesdeOrigen(origen) as number;
      await exigirOrigenActivo(tx, origen.proveedorId, origen.plataformaId);
      await moverStock(tx, tipo, comprobante.items);
      const totales = totalesDe(comprobante.items);

      return comprobanteRepository.actualizar(
        id,
        {
          comprobanteEstado: COMPROBANTE_CONFIRMADO,
          comprobanteTipo: tipo,
          comprobanteTotal: totales.comprobanteTotal,
          comprobanteIVA: totales.comprobanteIVA,
          proveedorId: origen.proveedorId,
          plataformaId: origen.plataformaId,
        },
        tx,
      );
    });
  },

  async eliminar(id: number) {
    await this.obtenerPendiente(id);
    await comprobanteRepository.eliminar(id);
  },

  async crearItem(comprobanteId: number, input: CrearItemInput) {
    await this.obtenerPendiente(comprobanteId);
    await exigirTalleSiViene(input.productoTallesId);
    await comprobanteRepository.crearItem({ comprobanteId, ...input });
    return this.obtener(comprobanteId);
  },

  async actualizarItem(comprobanteId: number, itemId: number, input: ActualizarItemInput) {
    await this.obtenerPendiente(comprobanteId);
    const item = await comprobanteRepository.findItem(comprobanteId, itemId);
    if (!item) {
      throw new AppError(404, "El ítem no existe");
    }
    await exigirTalleSiViene(input.productoTallesId);
    await comprobanteRepository.actualizarItem(itemId, input);
    return this.obtener(comprobanteId);
  },

  async eliminarItem(comprobanteId: number, itemId: number) {
    await this.obtenerPendiente(comprobanteId);
    const item = await comprobanteRepository.findItem(comprobanteId, itemId);
    if (!item) {
      throw new AppError(404, "El ítem no existe");
    }
    await comprobanteRepository.eliminarItem(itemId);
  },

  async obtenerPendiente(id: number) {
    const comprobante = await this.obtener(id);
    if (comprobante.comprobanteEstado !== COMPROBANTE_PENDIENTE) {
      throw new AppError(400, "El comprobante confirmado no se puede modificar");
    }
    return comprobante;
  },
};

async function exigirProveedorActivo(proveedorId: number | null) {
  if (proveedorId == null) {
    return;
  }
  const proveedor = await proveedorRepository.findActivo(proveedorId);
  if (!proveedor) {
    throw new AppError(400, "El proveedor no existe");
  }
}

async function exigirPlataformaActiva(plataformaId: number | null) {
  if (plataformaId == null) {
    return;
  }
  const plataforma = await plataformaRepository.findActiva(plataformaId);
  if (!plataforma) {
    throw new AppError(400, "La plataforma no existe");
  }
}
