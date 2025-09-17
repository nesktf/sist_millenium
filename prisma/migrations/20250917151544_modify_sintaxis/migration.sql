-- CreateEnum
CREATE TYPE "public"."EstadoProveedor" AS ENUM ('ACTIVO', 'INACTIVO');

-- CreateEnum
CREATE TYPE "public"."EstadoOrdenPago" AS ENUM ('PENDIENTE', 'PAGADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "public"."FormaDePago" AS ENUM ('EFECTIVO', 'TRANSFERENCIA');

-- CreateTable
CREATE TABLE "public"."Proveedor" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "cuit" TEXT NOT NULL,
    "razon_social" TEXT NOT NULL,
    "domicilio" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "estado" "public"."EstadoProveedor" NOT NULL,

    CONSTRAINT "Proveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TipoComprobanteProveedor" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "TipoComprobanteProveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ComprobanteProveedor" (
    "id" SERIAL NOT NULL,
    "id_proveedor" INTEGER NOT NULL,
    "id_tipo_comprobante" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "letra" VARCHAR(1) NOT NULL,
    "sucursal" VARCHAR(1) NOT NULL,
    "numero" VARCHAR(1) NOT NULL,

    CONSTRAINT "ComprobanteProveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DetalleComprobanteProveedor" (
    "id" SERIAL NOT NULL,
    "id_comprobante" INTEGER NOT NULL,
    "id_articulo" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" INTEGER NOT NULL,
    "observacion" TEXT,

    CONSTRAINT "DetalleComprobanteProveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrdenPago" (
    "id" SERIAL NOT NULL,
    "id_comprobante" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "estado" "public"."EstadoOrdenPago" NOT NULL,

    CONSTRAINT "OrdenPago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DetalleOrdenCompra" (
    "id" SERIAL NOT NULL,
    "id_orden" INTEGER NOT NULL,
    "id_articulo" INTEGER NOT NULL,

    CONSTRAINT "DetalleOrdenCompra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrdenCompra" (
    "id" SERIAL NOT NULL,
    "precio_total" INTEGER NOT NULL,
    "forma_pago" "public"."FormaDePago" NOT NULL,

    CONSTRAINT "OrdenCompra_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrdenPago_id_comprobante_key" ON "public"."OrdenPago"("id_comprobante");

-- AddForeignKey
ALTER TABLE "public"."ComprobanteProveedor" ADD CONSTRAINT "ComprobanteProveedor_id_proveedor_fkey" FOREIGN KEY ("id_proveedor") REFERENCES "public"."Proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ComprobanteProveedor" ADD CONSTRAINT "ComprobanteProveedor_id_tipo_comprobante_fkey" FOREIGN KEY ("id_tipo_comprobante") REFERENCES "public"."TipoComprobanteProveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DetalleComprobanteProveedor" ADD CONSTRAINT "DetalleComprobanteProveedor_id_comprobante_fkey" FOREIGN KEY ("id_comprobante") REFERENCES "public"."ComprobanteProveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DetalleComprobanteProveedor" ADD CONSTRAINT "DetalleComprobanteProveedor_id_articulo_fkey" FOREIGN KEY ("id_articulo") REFERENCES "public"."Articulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrdenPago" ADD CONSTRAINT "OrdenPago_id_comprobante_fkey" FOREIGN KEY ("id_comprobante") REFERENCES "public"."ComprobanteProveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DetalleOrdenCompra" ADD CONSTRAINT "DetalleOrdenCompra_id_orden_fkey" FOREIGN KEY ("id_orden") REFERENCES "public"."OrdenCompra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DetalleOrdenCompra" ADD CONSTRAINT "DetalleOrdenCompra_id_articulo_fkey" FOREIGN KEY ("id_articulo") REFERENCES "public"."Articulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
