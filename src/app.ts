import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { accesoRouter } from "./modules/accesos/acceso.routes";
import { comprobanteRouter } from "./modules/comprobantes/comprobante.routes";
import { contextoIARouter } from "./modules/contextos-ia/contexto-ia.routes";
import { grupoRouter } from "./modules/grupos/grupo.routes";
import { n8nRouter } from "./modules/n8n/n8n.routes";
import { plataformaRouter } from "./modules/plataformas/plataforma.routes";
import { productoRouter } from "./modules/productos/producto.routes";
import { proveedorRouter } from "./modules/proveedores/proveedor.routes";
import { seguridadRouter } from "./modules/seguridad/seguridad.routes";
import { stockRouter } from "./modules/stock/stock.routes";
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
  app.use("/api/plataformas", plataformaRouter);
  app.use("/api/proveedores", proveedorRouter);
  app.use("/api/productos", productoRouter);
  app.use("/api/stock", stockRouter);
  app.use("/api/comprobantes", comprobanteRouter);
  app.use("/api/contextos-ia", contextoIARouter);
  app.use("/api/n8n", n8nRouter);
  app.use(errorMiddleware);
  return app;
}
