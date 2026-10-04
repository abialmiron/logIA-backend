import { Router } from "express";
import { requireAcceso, requireAuth } from "../seguridad/auth.middleware";
import {
  actualizarComprobante,
  actualizarItem,
  confirmarComprobante,
  crearComprobanteConfirmado,
  crearItem,
  eliminarComprobante,
  eliminarItem,
  listarComprobantes,
  obtenerComprobante,
} from "./comprobante.controller";

export const comprobanteRouter = Router();

comprobanteRouter.get("/", requireAuth, requireAcceso("comprobantefind"), listarComprobantes);
comprobanteRouter.get("/:id", requireAuth, requireAcceso("comprobantefind"), obtenerComprobante);
comprobanteRouter.post("/", requireAuth, requireAcceso("comprobanteadd"), crearComprobanteConfirmado);
comprobanteRouter.post(
  "/:id/confirmar",
  requireAuth,
  requireAcceso("comprobanteupd"),
  confirmarComprobante,
);
comprobanteRouter.patch("/:id", requireAuth, requireAcceso("comprobanteupd"), actualizarComprobante);
comprobanteRouter.delete("/:id", requireAuth, requireAcceso("comprobantedel"), eliminarComprobante);
comprobanteRouter.post("/:id/items", requireAuth, requireAcceso("comprobanteitemadd"), crearItem);
comprobanteRouter.patch(
  "/:id/items/:itemId",
  requireAuth,
  requireAcceso("comprobanteitemupd"),
  actualizarItem,
);
comprobanteRouter.delete(
  "/:id/items/:itemId",
  requireAuth,
  requireAcceso("comprobanteitemdel"),
  eliminarItem,
);
