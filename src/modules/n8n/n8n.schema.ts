import { z } from "zod";

export const contextoPorMailSchema = z.object({
  mail: z.email("Ingresá un mail válido"),
});
