import type { Request, Response } from "express";
import { contextoIAService } from "../contextos-ia/contexto-ia.service";
import { asyncHandler } from "../../shared/async-handler";
import { contextoPorMailSchema } from "./n8n.schema";

export const contextoPorMail = asyncHandler(async (req: Request, res: Response) => {
  const { mail } = contextoPorMailSchema.parse(req.query);
  const contexto = await contextoIAService.porMail(mail);
  res.json(contexto);
});
