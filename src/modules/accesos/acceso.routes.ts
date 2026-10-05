import { Router } from "express";
import { requireAcceso, requireAuth } from "../seguridad/auth.middleware";
import { crearAcceso, listarAccesos } from "./acceso.controller";

export const accesoRouter = Router();

accesoRouter.get("/", requireAuth, requireAcceso("accesofind"), listarAccesos);
accesoRouter.post("/", requireAuth, requireAcceso("accesoadd"), crearAcceso);
