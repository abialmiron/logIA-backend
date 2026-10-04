import { Router } from "express";
import { requireAuth } from "./auth.middleware";
import { login, me } from "./seguridad.controller";

export const seguridadRouter = Router();

seguridadRouter.post("/login", login);
seguridadRouter.get("/me", requireAuth, me);
