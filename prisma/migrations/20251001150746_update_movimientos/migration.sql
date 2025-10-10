/*
  Warnings:

  - You are about to drop the column `tipo` on the `MovimientoStock` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."NaturalezaMovimiento" AS ENUM ('INGRESO', 'EGRESO');

-- AlterTable
ALTER TABLE "public"."MovimientoStock" DROP COLUMN "tipo",
ADD COLUMN     "id_tipo_operacion" INTEGER;

-- DropEnum
DROP TYPE "public"."TipoMovimiento";

-- CreateTable
CREATE TABLE "public"."TipoOperacion" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "naturaleza" "public"."NaturalezaMovimiento" NOT NULL,

    CONSTRAINT "TipoOperacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TipoOperacion_nombre_key" ON "public"."TipoOperacion"("nombre");

-- AddForeignKey
ALTER TABLE "public"."MovimientoStock" ADD CONSTRAINT "MovimientoStock_id_tipo_operacion_fkey" FOREIGN KEY ("id_tipo_operacion") REFERENCES "public"."TipoOperacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
