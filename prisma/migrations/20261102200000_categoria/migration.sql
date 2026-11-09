-- Categorías en árbol + permiso aparte + FK en Producto (con datos existentes).

CREATE TABLE "Categoria" (
    "id" SERIAL NOT NULL,
    "categoriaNombre" TEXT NOT NULL,
    "categoriaBaja" TIMESTAMP(3),
    "categoriaPadreId" INTEGER,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- Nombre único entre hermanos (incluye varias raíces con el mismo nombre).
-- Requiere PostgreSQL 15+.
CREATE UNIQUE INDEX "Categoria_categoriaPadreId_categoriaNombre_key"
ON "Categoria" ("categoriaPadreId", "categoriaNombre") NULLS NOT DISTINCT;

ALTER TABLE "Categoria"
ADD CONSTRAINT "Categoria_categoriaPadreId_fkey"
FOREIGN KEY ("categoriaPadreId") REFERENCES "Categoria"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "Categoria" ("categoriaNombre")
VALUES ('Sin clasificar');

ALTER TABLE "Producto" ADD COLUMN "categoriaId" INTEGER;

UPDATE "Producto"
SET "categoriaId" = (SELECT "id" FROM "Categoria" WHERE "categoriaNombre" = 'Sin clasificar' LIMIT 1);

ALTER TABLE "Producto" ALTER COLUMN "categoriaId" SET NOT NULL;

ALTER TABLE "Producto"
ADD CONSTRAINT "Producto_categoriaId_fkey"
FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "Acceso" ("id", "accesoOrden", "accesoDescripcion")
VALUES ('categoria', 14, 'Categorías');

INSERT INTO "Acceso" ("id", "accesoPadre", "accesoOrden", "accesoDescripcion")
VALUES
    ('categoriafind', 'categoria', 1, 'Consultar Categorías'),
    ('categoriaadd', 'categoria', 2, 'Crear Categorías'),
    ('categoriaupd', 'categoria', 3, 'Modificar Categorías'),
    ('categoriadel', 'categoria', 4, 'Baja lógica de Categorías');

INSERT INTO "AccesoGrupo" ("grupoId", "accesoId", "accesoGrupoValor")
SELECT grupo."id", acceso."id", TRUE
FROM "Grupo" AS grupo
CROSS JOIN "Acceso" AS acceso
WHERE grupo."grupoNombre" = 'Administrador'
  AND acceso."id" IN ('categoria', 'categoriafind', 'categoriaadd', 'categoriaupd', 'categoriadel');
