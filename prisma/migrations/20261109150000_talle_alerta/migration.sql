-- Alerta de stock bajo por talle; se deja de usar a nivel producto.
ALTER TABLE "ProductoTalles" ADD COLUMN "productoTallesAlerta" INTEGER;

ALTER TABLE "Producto" DROP COLUMN "productoAlerta";
