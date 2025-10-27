/*
  Warnings:

  - You are about to drop the column `id_orden_pago` on the `ComprobanteProveedor` table. All the data in the column will be lost.
  - Added the required column `forma_pago` to the `OrdenPago` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."EstadoComprobanteEnOrden" AS ENUM ('PENDIENTE', 'PARCIAL', 'PAGADO');

-- DropForeignKey
ALTER TABLE "public"."ComprobanteProveedor" DROP CONSTRAINT "ComprobanteProveedor_id_orden_pago_fkey";

-- AlterTable
ALTER TABLE "public"."ComprobanteProveedor" DROP COLUMN "id_orden_pago";

-- AlterTable
ALTER TABLE "public"."OrdenPago" ADD COLUMN     "forma_pago" "public"."FormaDePago" NOT NULL,
ADD COLUMN     "referencia" VARCHAR(255);

-- CreateTable
CREATE TABLE "public"."ComprobanteOrdenPago" (
    "id" SERIAL NOT NULL,
    "id_comprobante" INTEGER NOT NULL,
    "id_orden_pago" INTEGER NOT NULL,
    "total_comprobante" INTEGER NOT NULL,
    "monto_pagado" INTEGER NOT NULL,
    "saldo_pendiente" INTEGER NOT NULL,
    "estado" "public"."EstadoComprobanteEnOrden" NOT NULL,

    CONSTRAINT "ComprobanteOrdenPago_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ComprobanteOrdenPago_id_comprobante_id_orden_pago_key" ON "public"."ComprobanteOrdenPago"("id_comprobante", "id_orden_pago");

-- AddForeignKey
ALTER TABLE "public"."ComprobanteOrdenPago" ADD CONSTRAINT "ComprobanteOrdenPago_id_comprobante_fkey" FOREIGN KEY ("id_comprobante") REFERENCES "public"."ComprobanteProveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ComprobanteOrdenPago" ADD CONSTRAINT "ComprobanteOrdenPago_id_orden_pago_fkey" FOREIGN KEY ("id_orden_pago") REFERENCES "public"."OrdenPago"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
