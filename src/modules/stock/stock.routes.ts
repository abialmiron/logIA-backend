import { Router } from "express";
import { requireAcceso, requireAuth } from "../seguridad/auth.middleware";
import { listarStock } from "./stock.controller";

export const stockRouter = Router();

stockRouter.get("/", requireAuth, requireAcceso("stockfind"), listarStock);
