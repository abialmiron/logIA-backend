import { Router } from "express";
import { contextoPorMail } from "./n8n.controller";
import { requireApiKey } from "./n8n.middleware";

export const n8nRouter = Router();

n8nRouter.get("/contexto", requireApiKey, contextoPorMail);
