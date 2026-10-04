import { Router } from "express";
import { cargarComprobantePendiente, contextoPorMail } from "./n8n.controller";
import { requireApiKey } from "./n8n.middleware";

export const n8nRouter = Router();

n8nRouter.get("/contexto", requireApiKey, contextoPorMail);
n8nRouter.post("/comprobantes", requireApiKey, cargarComprobantePendiente);
