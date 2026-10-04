import { Router } from "express";
import { requireAcceso, requireAuth } from "../seguridad/auth.middleware";
import { crearUsuario } from "./usuario.controller";

export const usuarioRouter = Router();

usuarioRouter.post("/", requireAuth, requireAcceso("usuarioadd"), crearUsuario);
