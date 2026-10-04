-- Un comprobante pendiente puede llegar incompleto. La confirmación exige los datos en la aplicación.

ALTER TABLE "Comprobante" ALTER COLUMN "comprobantePuntoVenta" DROP NOT NULL;
ALTER TABLE "Comprobante" ALTER COLUMN "comprobanteNro" DROP NOT NULL;
ALTER TABLE "Comprobante" ALTER COLUMN "comprobanteTipo" DROP NOT NULL;
ALTER TABLE "Comprobante" ALTER COLUMN "comprobanteTotal" DROP NOT NULL;
ALTER TABLE "Comprobante" ALTER COLUMN "comprobanteIVA" DROP NOT NULL;

ALTER TABLE "ComprobanteItem" ALTER COLUMN "comprobanteItemCant" DROP NOT NULL;
ALTER TABLE "ComprobanteItem" ALTER COLUMN "productoTallesId" DROP NOT NULL;
ALTER TABLE "ComprobanteItem" ALTER COLUMN "comprobanteItemIVA" DROP NOT NULL;
ALTER TABLE "ComprobanteItem" ALTER COLUMN "comprobanteItemTotal" DROP NOT NULL;
