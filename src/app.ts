import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { accesoRouter } from "./modules/accesos/acceso.routes";
import { grupoRouter } from "./modules/grupos/grupo.routes";
import { seguridadRouter } from "./modules/seguridad/seguridad.routes";
import { usuarioRouter } from "./modules/usuarios/usuario.routes";
import { errorMiddleware } from "./shared/error-middleware";

export function createApp() {
  const app = express();
  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json());
  app.use("/api/seguridad", seguridadRouter);
  app.use("/api/usuarios", usuarioRouter);
  app.use("/api/grupos", grupoRouter);
  app.use("/api/accesos", accesoRouter);
  app.use(errorMiddleware);
  return app;
}
