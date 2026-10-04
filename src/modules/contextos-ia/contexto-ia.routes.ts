import { Router } from "express";
import { requireAcceso, requireAuth } from "../seguridad/auth.middleware";
import {
  actualizarContextoIA,
  crearContextoIA,
  eliminarContextoIA,
  listarContextosIA,
  obtenerContextoIA,
} from "./contexto-ia.controller";

export const contextoIARouter = Router();

contextoIARouter.get("/", requireAuth, requireAcceso("contextoiafind"), listarContextosIA);
contextoIARouter.get("/:id", requireAuth, requireAcceso("contextoiafind"), obtenerContextoIA);
contextoIARouter.post("/", requireAuth, requireAcceso("contextoiaadd"), crearContextoIA);
contextoIARouter.patch("/:id", requireAuth, requireAcceso("contextoiaupd"), actualizarContextoIA);
contextoIARouter.delete("/:id", requireAuth, requireAcceso("contextoiadel"), eliminarContextoIA);
