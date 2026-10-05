import { Router } from "express";
import { requireAcceso, requireAuth } from "../seguridad/auth.middleware";
import {
  actualizarGrupo,
  asignarUsuario,
  crearGrupo,
  darDeBajaGrupo,
  listarGrupos,
  listarUsuariosDelGrupo,
  obtenerGrupo,
  quitarUsuario,
} from "./grupo.controller";

export const grupoRouter = Router();

grupoRouter.get("/", requireAuth, requireAcceso("grupofind"), listarGrupos);
grupoRouter.post("/", requireAuth, crearGrupo);
grupoRouter.get(
  "/:id/usuarios",
  requireAuth,
  requireAcceso("grupousuariofind"),
  listarUsuariosDelGrupo,
);
grupoRouter.post("/:id/usuarios", requireAuth, asignarUsuario);
grupoRouter.delete("/:id/usuarios/:usuarioId", requireAuth, quitarUsuario);
grupoRouter.get("/:id", requireAuth, requireAcceso("grupofind"), obtenerGrupo);
grupoRouter.patch("/:id", requireAuth, actualizarGrupo);
grupoRouter.delete("/:id", requireAuth, darDeBajaGrupo);
