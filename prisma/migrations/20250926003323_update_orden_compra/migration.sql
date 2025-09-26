/*
  Warnings:

  - You are about to drop the column `total` on the `OrdenCompra` table. All the data in the column will be lost.
  - Added the required column `cantidad` to the `DetalleOrdenCompra` table without a default value. This is not possible if the table is not empty.
  - Added the required column `precio` to the `DetalleOrdenCompra` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."ComprobanteProveedor" ADD COLUMN     "id_orden_compra" INTEGER;

-- AlterTable
ALTER TABLE "public"."DetalleOrdenCompra" ADD COLUMN     "cantidad" INTEGER NOT NULL,
ADD COLUMN     "precio" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."OrdenCompra" DROP COLUMN "total";

-- AddForeignKey
ALTER TABLE "public"."ComprobanteProveedor" ADD CONSTRAINT "ComprobanteProveedor_id_orden_compra_fkey" FOREIGN KEY ("id_orden_compra") REFERENCES "public"."OrdenCompra"("id") ON DELETE SET NULL ON UPDATE CASCADE;
