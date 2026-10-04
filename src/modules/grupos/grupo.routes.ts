import { Router } from "express";
import { requireAcceso, requireAuth } from "../seguridad/auth.middleware";
import { asignarUsuario, crearGrupo } from "./grupo.controller";

export const grupoRouter = Router();

grupoRouter.post("/", requireAuth, requireAcceso("grupoadd"), crearGrupo);
grupoRouter.post(
  "/:grupoId/usuarios",
  requireAuth,
  requireAcceso("grupousuarioadd"),
  asignarUsuario,
);
