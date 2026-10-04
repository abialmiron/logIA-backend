import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/async-handler";
import { crearAccesoSchema } from "./acceso.schema";
import { accesoService } from "./acceso.service";

export const crearAcceso = asyncHandler(async (req: Request, res: Response) => {
  const body = crearAccesoSchema.parse(req.body);
  const acceso = await accesoService.crear(body);
  res.status(201).json(acceso);
});
