-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "usuarioNombre" TEXT NOT NULL,
    "usuarioContrasenia" TEXT NOT NULL,
    "usuarioBaja" TIMESTAMP(3),
    "usuarioMail" TEXT NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Grupo" (
    "id" SERIAL NOT NULL,
    "grupoNombre" TEXT NOT NULL,
    "grupoBaja" TIMESTAMP(3),

    CONSTRAINT "Grupo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrupoUsuario" (
    "id" SERIAL NOT NULL,
    "grupoId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,

    CONSTRAINT "GrupoUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Acceso" (
    "id" VARCHAR(50) NOT NULL,
    "accesoPadre" VARCHAR(50),
    "accesoOrden" INTEGER,
    "accesoDescripcion" TEXT,

    CONSTRAINT "Acceso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccesoGrupo" (
    "id" SERIAL NOT NULL,
    "grupoId" INTEGER NOT NULL,
    "accesoId" VARCHAR(50) NOT NULL,
    "accesoGrupoValor" BOOLEAN NOT NULL,

    CONSTRAINT "AccesoGrupo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proveedor" (
    "id" SERIAL NOT NULL,
    "proveedorRazonSocial" TEXT NOT NULL,
    "proveedorCUIT" TEXT NOT NULL,
    "proveedorBaja" TIMESTAMP(3),
    "proveedorMail" TEXT NOT NULL,
    "plataformaId" INTEGER,
    "proveedorParam" TEXT,
    "proveedorCondIVA" INTEGER,

    CONSTRAINT "Proveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plataforma" (
    "id" SERIAL NOT NULL,
    "plataformaNombre" TEXT NOT NULL,
    "plataformaMail" TEXT NOT NULL,
    "plataformaBaja" TIMESTAMP(3),
    "plataformaParam" TEXT,

    CONSTRAINT "Plataforma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContextoIA" (
    "id" SERIAL NOT NULL,
    "proveedorId" INTEGER,
    "plataformaId" INTEGER,
    "archivoEjemplo" TEXT,
    "mapeoCampo" TEXT,
    "aaasttem" TEXT,

    CONSTRAINT "ContextoIA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Producto" (
    "id" SERIAL NOT NULL,
    "productoNombre" TEXT NOT NULL,
    "productoSKU" TEXT NOT NULL,
    "productoBaja" TIMESTAMP(3),
    "proveedorId" INTEGER NOT NULL,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductoTalles" (
    "id" SERIAL NOT NULL,
    "productoId" INTEGER NOT NULL,
    "productoTalles" TEXT NOT NULL,

    CONSTRAINT "ProductoTalles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stock" (
    "id" SERIAL NOT NULL,
    "productoId" INTEGER NOT NULL,
    "stockCantidad" INTEGER NOT NULL,
    "productoTallesId" INTEGER NOT NULL,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comprobante" (
    "id" SERIAL NOT NULL,
    "comprobantePuntoVenta" INTEGER NOT NULL,
    "comprobanteNro" INTEGER NOT NULL,
    "comprobanteTipo" INTEGER NOT NULL,
    "comprobanteEstado" INTEGER NOT NULL,
    "comprobanteTotal" DOUBLE PRECISION NOT NULL,
    "comprobanteIVA" DOUBLE PRECISION NOT NULL,
    "comprobante3SON" TEXT,
    "proveedorId" INTEGER,
    "plataformaId" INTEGER,

    CONSTRAINT "Comprobante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComprobanteItem" (
    "id" SERIAL NOT NULL,
    "comprobanteId" INTEGER NOT NULL,
    "comprobanteItemCant" INTEGER NOT NULL,
    "productoTallesId" INTEGER NOT NULL,
    "comprobanteItemDesc" TEXT,
    "comprobanteItemIVA" DOUBLE PRECISION NOT NULL,
    "comprobanteItemTotal" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ComprobanteItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_usuarioMail_key" ON "Usuario"("usuarioMail");

-- CreateIndex
CREATE UNIQUE INDEX "GrupoUsuario_usuarioId_grupoId_key" ON "GrupoUsuario"("usuarioId", "grupoId");

-- AddForeignKey
ALTER TABLE "GrupoUsuario" ADD CONSTRAINT "GrupoUsuario_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "Grupo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrupoUsuario" ADD CONSTRAINT "GrupoUsuario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Acceso" ADD CONSTRAINT "Acceso_accesoPadre_fkey" FOREIGN KEY ("accesoPadre") REFERENCES "Acceso"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccesoGrupo" ADD CONSTRAINT "AccesoGrupo_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "Grupo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccesoGrupo" ADD CONSTRAINT "AccesoGrupo_accesoId_fkey" FOREIGN KEY ("accesoId") REFERENCES "Acceso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proveedor" ADD CONSTRAINT "Proveedor_plataformaId_fkey" FOREIGN KEY ("plataformaId") REFERENCES "Plataforma"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContextoIA" ADD CONSTRAINT "ContextoIA_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContextoIA" ADD CONSTRAINT "ContextoIA_plataformaId_fkey" FOREIGN KEY ("plataformaId") REFERENCES "Plataforma"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductoTalles" ADD CONSTRAINT "ProductoTalles_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_productoTallesId_fkey" FOREIGN KEY ("productoTallesId") REFERENCES "ProductoTalles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comprobante" ADD CONSTRAINT "Comprobante_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comprobante" ADD CONSTRAINT "Comprobante_plataformaId_fkey" FOREIGN KEY ("plataformaId") REFERENCES "Plataforma"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComprobanteItem" ADD CONSTRAINT "ComprobanteItem_comprobanteId_fkey" FOREIGN KEY ("comprobanteId") REFERENCES "Comprobante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComprobanteItem" ADD CONSTRAINT "ComprobanteItem_productoTallesId_fkey" FOREIGN KEY ("productoTallesId") REFERENCES "ProductoTalles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Datos iniciales para arrancar de cero.
-- Usuario admin: admin@logia.com / admin123
-- Cada pantalla es el id del acceso padre. Las acciones son ese id más find, add, upd o del.

INSERT INTO "Acceso" ("id", "accesoOrden", "accesoDescripcion") VALUES
    ('usuario', 1, 'Usuarios'),
    ('grupo', 2, 'Grupos'),
    ('grupousuario', 3, 'Usuarios por grupo'),
    ('acceso', 4, 'Accesos'),
    ('accesogrupo', 5, 'Accesos por grupo'),
    ('proveedor', 6, 'Proveedores'),
    ('plataforma', 7, 'Plataformas'),
    ('contextoia', 8, 'Contextos IA'),
    ('producto', 9, 'Productos'),
    ('productotalles', 10, 'Talles de producto'),
    ('stock', 11, 'Stock'),
    ('comprobante', 12, 'Comprobantes'),
    ('comprobanteitem', 13, 'Ítems de comprobante');

INSERT INTO "Acceso" ("id", "accesoPadre", "accesoOrden", "accesoDescripcion")
SELECT
    pantalla."id" || accion.sufijo,
    pantalla."id",
    accion.orden,
    accion.nombre || ' ' || pantalla."accesoDescripcion"
FROM "Acceso" AS pantalla
CROSS JOIN (
    VALUES
        ('find', 1, 'Consultar'),
        ('add', 2, 'Crear'),
        ('upd', 3, 'Modificar'),
        ('del', 4, 'Baja lógica de')
) AS accion(sufijo, orden, nombre)
WHERE pantalla."accesoPadre" IS NULL;

INSERT INTO "Grupo" ("grupoNombre") VALUES ('Administrador');

INSERT INTO "Usuario" ("usuarioNombre", "usuarioContrasenia", "usuarioMail")
VALUES (
    'Admin',
    '$2b$10$qEH5EZhYDv1x3xk/zwIHoOxSXcGkOjAio91FSuWlFTVno2HvjioSe',
    'admin@logia.com'
);

INSERT INTO "GrupoUsuario" ("grupoId", "usuarioId")
SELECT grupo."id", usuario."id"
FROM "Grupo" AS grupo
CROSS JOIN "Usuario" AS usuario
WHERE grupo."grupoNombre" = 'Administrador'
  AND usuario."usuarioMail" = 'admin@logia.com';

INSERT INTO "AccesoGrupo" ("grupoId", "accesoId", "accesoGrupoValor")
SELECT grupo."id", acceso."id", TRUE
FROM "Grupo" AS grupo
CROSS JOIN "Acceso" AS acceso
WHERE grupo."grupoNombre" = 'Administrador';
