import "dotenv/config";

function requerida(nombre: string): string {
  const valor = process.env[nombre];
  if (!valor) {
    throw new Error(`Falta la variable de entorno ${nombre}`);
  }
  return valor;
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: requerida("DATABASE_URL"),
  jwtSecret: requerida("JWT_SECRET"),
  n8nApiKey: requerida("N8N_API_KEY"),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
};
