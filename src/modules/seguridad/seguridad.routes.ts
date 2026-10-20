import { Router } from "express";
import { requireAuth } from "./auth.middleware";
import { login, me, olvideContrasena, recuperarContrasena } from "./seguridad.controller";

export const seguridadRouter = Router();

seguridadRouter.post("/login", login);
seguridadRouter.get("/me", requireAuth, me);
seguridadRouter.post("/olvide-contrasena", olvideContrasena);
seguridadRouter.post("/recuperar-contrasena", recuperarContrasena);
