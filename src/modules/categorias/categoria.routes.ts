import { Router } from "express";
import { requireAcceso, requireAuth } from "../seguridad/auth.middleware";
import {
  actualizarCategoria,
  crearCategoria,
  darDeBajaCategoria,
  listarCategorias,
  obtenerCategoria,
  reactivarCategoria,
} from "./categoria.controller";

export const categoriaRouter = Router();

categoriaRouter.get("/", requireAuth, requireAcceso("categoriafind"), listarCategorias);
categoriaRouter.get("/:id", requireAuth, requireAcceso("categoriafind"), obtenerCategoria);
categoriaRouter.post("/", requireAuth, requireAcceso("categoriaadd"), crearCategoria);
categoriaRouter.patch("/:id", requireAuth, requireAcceso("categoriaupd"), actualizarCategoria);
categoriaRouter.post("/:id/reactivar", requireAuth, requireAcceso("categoriaupd"), reactivarCategoria);
categoriaRouter.delete("/:id", requireAuth, requireAcceso("categoriadel"), darDeBajaCategoria);
