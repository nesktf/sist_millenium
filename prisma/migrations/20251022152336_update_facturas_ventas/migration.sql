-- CreateEnum
CREATE TYPE "public"."EstadoFacturaVenta" AS ENUM ('PENDIENTE', 'EN_PREPARACION', 'ENVIADA', 'ENTREGADA', 'CANCELADA');

-- CreateTable
CREATE TABLE "public"."FacturaVenta" (
    "id" SERIAL NOT NULL,
    "numero" TEXT NOT NULL,
    "fecha_emision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total" INTEGER NOT NULL,
    "estado" "public"."EstadoFacturaVenta" NOT NULL,
    "id_venta" INTEGER NOT NULL,

    CONSTRAINT "FacturaVenta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FacturaVenta_numero_key" ON "public"."FacturaVenta"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "FacturaVenta_id_venta_key" ON "public"."FacturaVenta"("id_venta");

-- AddForeignKey
ALTER TABLE "public"."FacturaVenta" ADD CONSTRAINT "FacturaVenta_id_venta_fkey" FOREIGN KEY ("id_venta") REFERENCES "public"."VentaArticulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
