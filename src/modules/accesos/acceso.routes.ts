import { Router } from "express";
import { requireAcceso, requireAuth } from "../seguridad/auth.middleware";
import { crearAcceso } from "./acceso.controller";

export const accesoRouter = Router();

accesoRouter.post("/", requireAuth, requireAcceso("accesoadd"), crearAcceso);
