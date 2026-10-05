import { Router } from "express";
import { requireAcceso, requireAuth } from "../seguridad/auth.middleware";
import {
  actualizarUsuario,
  crearUsuario,
  darDeBajaUsuario,
  listarUsuarios,
  obtenerUsuario,
} from "./usuario.controller";

export const usuarioRouter = Router();

usuarioRouter.get("/", requireAuth, requireAcceso("usuariofind"), listarUsuarios);
usuarioRouter.get("/:id", requireAuth, requireAcceso("usuariofind"), obtenerUsuario);
usuarioRouter.post("/", requireAuth, requireAcceso("usuarioadd"), crearUsuario);
usuarioRouter.patch("/:id", requireAuth, requireAcceso("usuarioupd"), actualizarUsuario);
usuarioRouter.delete("/:id", requireAuth, requireAcceso("usuariodel"), darDeBajaUsuario);
