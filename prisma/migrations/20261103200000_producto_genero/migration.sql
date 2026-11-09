-- Género del producto: masculino | femenino | unisex
-- Productos existentes quedan en unisex.

ALTER TABLE "Producto" ADD COLUMN "productoGenero" TEXT;

UPDATE "Producto" SET "productoGenero" = 'unisex' WHERE "productoGenero" IS NULL;

ALTER TABLE "Producto" ALTER COLUMN "productoGenero" SET NOT NULL;
