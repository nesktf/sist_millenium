/*
  Warnings:

  - You are about to drop the column `articulo_id` on the `ArticDepos` table. All the data in the column will be lost.
  - You are about to drop the column `deposito_id` on the `ArticDepos` table. All the data in the column will be lost.
  - You are about to drop the column `u_medida` on the `Articulo` table. All the data in the column will be lost.
  - You are about to drop the column `dep_destino_id` on the `MovimientoStock` table. All the data in the column will be lost.
  - You are about to drop the column `dep_origen_id` on the `MovimientoStock` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[num_comprobante]` on the table `MovimientoStock` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id_articulo` to the `ArticDepos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_deposito` to the `ArticDepos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_deposito` to the `MovimientoStock` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."ArticDepos" DROP CONSTRAINT "ArticDepos_articulo_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ArticDepos" DROP CONSTRAINT "ArticDepos_deposito_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."MovimientoStock" DROP CONSTRAINT "MovimientoStock_dep_destino_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."MovimientoStock" DROP CONSTRAINT "MovimientoStock_dep_origen_id_fkey";

-- AlterTable
ALTER TABLE "public"."ArticDepos" DROP COLUMN "articulo_id",
DROP COLUMN "deposito_id",
ADD COLUMN     "id_articulo" INTEGER NOT NULL,
ADD COLUMN     "id_deposito" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."Articulo" DROP COLUMN "u_medida";

-- AlterTable
ALTER TABLE "public"."MovimientoStock" DROP COLUMN "dep_destino_id",
DROP COLUMN "dep_origen_id",
ADD COLUMN     "id_deposito" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "MovimientoStock_num_comprobante_key" ON "public"."MovimientoStock"("num_comprobante");

-- AddForeignKey
ALTER TABLE "public"."ArticDepos" ADD CONSTRAINT "ArticDepos_id_deposito_fkey" FOREIGN KEY ("id_deposito") REFERENCES "public"."Deposito"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ArticDepos" ADD CONSTRAINT "ArticDepos_id_articulo_fkey" FOREIGN KEY ("id_articulo") REFERENCES "public"."Articulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MovimientoStock" ADD CONSTRAINT "MovimientoStock_id_deposito_fkey" FOREIGN KEY ("id_deposito") REFERENCES "public"."Deposito"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
