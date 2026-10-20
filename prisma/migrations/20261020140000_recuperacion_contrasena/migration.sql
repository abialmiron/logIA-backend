CREATE TABLE "RecuperacionContrasena" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expira" TIMESTAMP(3) NOT NULL,
    "usadoEn" TIMESTAMP(3),

    CONSTRAINT "RecuperacionContrasena_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "RecuperacionContrasena" ADD CONSTRAINT "RecuperacionContrasena_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
