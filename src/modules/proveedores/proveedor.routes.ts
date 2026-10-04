import { Router } from "express";
import { requireAcceso, requireAuth } from "../seguridad/auth.middleware";
import {
  actualizarProveedor,
  crearProveedor,
  darDeBajaProveedor,
  listarProveedores,
  obtenerProveedor,
} from "./proveedor.controller";

export const proveedorRouter = Router();

proveedorRouter.get("/", requireAuth, requireAcceso("proveedorfind"), listarProveedores);
proveedorRouter.get("/:id", requireAuth, requireAcceso("proveedorfind"), obtenerProveedor);
proveedorRouter.post("/", requireAuth, requireAcceso("proveedoradd"), crearProveedor);
proveedorRouter.patch("/:id", requireAuth, requireAcceso("proveedorupd"), actualizarProveedor);
proveedorRouter.delete("/:id", requireAuth, requireAcceso("proveedordel"), darDeBajaProveedor);
