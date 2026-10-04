import { Router } from "express";
import { requireAcceso, requireAuth } from "../seguridad/auth.middleware";
import {
  actualizarProducto,
  actualizarTalle,
  crearProducto,
  crearTalle,
  darDeBajaProducto,
  eliminarTalle,
  listarProductos,
  obtenerProducto,
} from "./producto.controller";

export const productoRouter = Router();

productoRouter.get("/", requireAuth, requireAcceso("productofind"), listarProductos);
productoRouter.get("/:id", requireAuth, requireAcceso("productofind"), obtenerProducto);
productoRouter.post("/", requireAuth, requireAcceso("productoadd"), crearProducto);
productoRouter.patch("/:id", requireAuth, requireAcceso("productoupd"), actualizarProducto);
productoRouter.delete("/:id", requireAuth, requireAcceso("productodel"), darDeBajaProducto);
productoRouter.post("/:id/talles", requireAuth, requireAcceso("productotallesadd"), crearTalle);
productoRouter.patch(
  "/:id/talles/:talleId",
  requireAuth,
  requireAcceso("productotallesupd"),
  actualizarTalle,
);
productoRouter.delete(
  "/:id/talles/:talleId",
  requireAuth,
  requireAcceso("productotallesdel"),
  eliminarTalle,
);
