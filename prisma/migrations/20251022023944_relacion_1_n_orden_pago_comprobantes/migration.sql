/*
  Warnings:

  - You are about to drop the column `id_comprobante` on the `OrdenPago` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."OrdenPago" DROP CONSTRAINT "OrdenPago_id_comprobante_fkey";

-- DropIndex
DROP INDEX "public"."OrdenPago_id_comprobante_key";

-- AlterTable
ALTER TABLE "public"."ComprobanteProveedor" ADD COLUMN     "id_orden_pago" INTEGER;

-- AlterTable
ALTER TABLE "public"."OrdenPago" DROP COLUMN "id_comprobante";

-- AddForeignKey
ALTER TABLE "public"."ComprobanteProveedor" ADD CONSTRAINT "ComprobanteProveedor_id_orden_pago_fkey" FOREIGN KEY ("id_orden_pago") REFERENCES "public"."OrdenPago"("id") ON DELETE SET NULL ON UPDATE CASCADE;
