import { Router } from "express";
import { requireAcceso, requireAuth } from "../seguridad/auth.middleware";
import {
  actualizarPlataforma,
  crearPlataforma,
  darDeBajaPlataforma,
  listarPlataformas,
  obtenerPlataforma,
} from "./plataforma.controller";

export const plataformaRouter = Router();

plataformaRouter.get("/", requireAuth, requireAcceso("plataformafind"), listarPlataformas);
plataformaRouter.get("/:id", requireAuth, requireAcceso("plataformafind"), obtenerPlataforma);
plataformaRouter.post("/", requireAuth, requireAcceso("plataformaadd"), crearPlataforma);
plataformaRouter.patch("/:id", requireAuth, requireAcceso("plataformaupd"), actualizarPlataforma);
plataformaRouter.delete("/:id", requireAuth, requireAcceso("plataformadel"), darDeBajaPlataforma);
