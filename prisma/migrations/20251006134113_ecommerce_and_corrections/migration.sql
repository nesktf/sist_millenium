/*
  Warnings:

  - Added the required column `total` to the `ComprobanteProveedor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fecha_esperada` to the `OrdenCompra` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_deposito` to the `OrdenCompra` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_proveedor` to the `OrdenCompra` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_proveedor` to the `OrdenPago` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numero` to the `OrdenPago` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `OrdenPago` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Articulo" ADD COLUMN     "imagen" TEXT;

-- AlterTable
ALTER TABLE "public"."ComprobanteProveedor" ADD COLUMN     "total" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."OrdenCompra" ADD COLUMN     "fecha_esperada" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "id_deposito" INTEGER NOT NULL,
ADD COLUMN     "id_proveedor" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."OrdenPago" ADD COLUMN     "id_proveedor" INTEGER NOT NULL,
ADD COLUMN     "numero" TEXT NOT NULL,
ADD COLUMN     "total" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "public"."UserEcommerce" (
    "id" SERIAL NOT NULL,
    "correo" TEXT NOT NULL,
    "contraseña" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "domicilio" TEXT NOT NULL,

    CONSTRAINT "UserEcommerce_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CarritoUser" (
    "id" SERIAL NOT NULL,
    "precio" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "id_articulo" INTEGER NOT NULL,
    "id_user" INTEGER NOT NULL,

    CONSTRAINT "CarritoUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VentaArticulo" (
    "id" SERIAL NOT NULL,
    "numero" TEXT NOT NULL,
    "total" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "id_user" INTEGER,

    CONSTRAINT "VentaArticulo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DetalleVentaArticulo" (
    "id" SERIAL NOT NULL,
    "precio" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "id_venta" INTEGER NOT NULL,
    "id_articulo" INTEGER NOT NULL,

    CONSTRAINT "DetalleVentaArticulo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."OrdenPago" ADD CONSTRAINT "OrdenPago_id_proveedor_fkey" FOREIGN KEY ("id_proveedor") REFERENCES "public"."Proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrdenCompra" ADD CONSTRAINT "OrdenCompra_id_proveedor_fkey" FOREIGN KEY ("id_proveedor") REFERENCES "public"."Proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrdenCompra" ADD CONSTRAINT "OrdenCompra_id_deposito_fkey" FOREIGN KEY ("id_deposito") REFERENCES "public"."Deposito"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CarritoUser" ADD CONSTRAINT "CarritoUser_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "public"."UserEcommerce"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CarritoUser" ADD CONSTRAINT "CarritoUser_id_articulo_fkey" FOREIGN KEY ("id_articulo") REFERENCES "public"."Articulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VentaArticulo" ADD CONSTRAINT "VentaArticulo_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "public"."UserEcommerce"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DetalleVentaArticulo" ADD CONSTRAINT "DetalleVentaArticulo_id_venta_fkey" FOREIGN KEY ("id_venta") REFERENCES "public"."VentaArticulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DetalleVentaArticulo" ADD CONSTRAINT "DetalleVentaArticulo_id_articulo_fkey" FOREIGN KEY ("id_articulo") REFERENCES "public"."Articulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
