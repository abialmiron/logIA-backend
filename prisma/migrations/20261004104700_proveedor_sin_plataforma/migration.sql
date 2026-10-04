-- Proveedor y plataforma son orígenes distintos. El proveedor no pertenece a una plataforma.

ALTER TABLE "Proveedor" DROP CONSTRAINT "Proveedor_plataformaId_fkey";

ALTER TABLE "Proveedor" DROP COLUMN "plataformaId";
