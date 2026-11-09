-- Umbral de stock bajo: null = sin alerta; número = mínimo para avisar.
ALTER TABLE "Producto" ADD COLUMN "productoAlerta" INTEGER;
