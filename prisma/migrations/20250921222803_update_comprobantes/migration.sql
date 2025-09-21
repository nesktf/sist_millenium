/*
  Warnings:

  - Added the required column `nombre` to the `Deposito` table without a default value. This is not possible if the table is not empty.
  - Added the required column `saldo` to the `OrdenCompra` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `OrdenCompra` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Deposito" ADD COLUMN     "nombre" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."OrdenCompra" ADD COLUMN     "saldo" INTEGER NOT NULL,
ADD COLUMN     "total" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."OrdenPago" ADD COLUMN     "cantidad" INTEGER;
