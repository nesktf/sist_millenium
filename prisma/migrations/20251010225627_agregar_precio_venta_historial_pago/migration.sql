/*
  Warnings:

  - You are about to drop the column `cantidad` on the `OrdenPago` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."OrdenPago" DROP COLUMN "cantidad",
ADD COLUMN     "saldo" INTEGER;

-- CreateTable
CREATE TABLE "public"."PrecioDeVenta" (
    "id" SERIAL NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "precio" INTEGER NOT NULL,

    CONSTRAINT "PrecioDeVenta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HistorialPago" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "id_orden_pago" INTEGER NOT NULL,
    "monto" INTEGER NOT NULL,
    "forma_pago" "public"."FormaDePago" NOT NULL,
    "referencia" VARCHAR(255),
    "saldo_anterior" INTEGER NOT NULL,
    "pendiente_por_pagar" INTEGER NOT NULL,

    CONSTRAINT "HistorialPago_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."PrecioDeVenta" ADD CONSTRAINT "PrecioDeVenta_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "public"."Articulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HistorialPago" ADD CONSTRAINT "HistorialPago_id_orden_pago_fkey" FOREIGN KEY ("id_orden_pago") REFERENCES "public"."OrdenPago"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
