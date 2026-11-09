import { Router } from "express";
import { requireAcceso, requireAuth } from "../seguridad/auth.middleware";
import { listarStock, listarStockBajoAlerta, obtenerFichaStock } from "./stock.controller";

export const stockRouter = Router();

stockRouter.get("/", requireAuth, requireAcceso("stockfind"), listarStock);
stockRouter.get("/alertas", requireAuth, requireAcceso("productofind"), listarStockBajoAlerta);
stockRouter.get("/:id", requireAuth, requireAcceso("stockfind"), obtenerFichaStock);
