-- Publicación de productos en plataformas (N:N).

CREATE TABLE "ProductoPlataforma" (
    "id" SERIAL NOT NULL,
    "productoId" INTEGER NOT NULL,
    "plataformaId" INTEGER NOT NULL,

    CONSTRAINT "ProductoPlataforma_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProductoPlataforma_productoId_plataformaId_key"
ON "ProductoPlataforma"("productoId", "plataformaId");

ALTER TABLE "ProductoPlataforma"
ADD CONSTRAINT "ProductoPlataforma_productoId_fkey"
FOREIGN KEY ("productoId") REFERENCES "Producto"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ProductoPlataforma"
ADD CONSTRAINT "ProductoPlataforma_plataformaId_fkey"
FOREIGN KEY ("plataformaId") REFERENCES "Plataforma"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
