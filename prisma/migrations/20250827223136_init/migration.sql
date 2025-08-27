-- CreateEnum
CREATE TYPE "public"."TipoMovimiento" AS ENUM ('INGRESO', 'EGRESO', 'TRANSFERENCIA');

-- CreateTable
CREATE TABLE "public"."CategoriaArticulo" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(60) NOT NULL,

    CONSTRAINT "CategoriaArticulo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MarcaArticulo" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(60) NOT NULL,

    CONSTRAINT "MarcaArticulo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Articulo" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(60) NOT NULL,
    "nombre" VARCHAR(120) NOT NULL,
    "id_categoria" INTEGER,
    "id_marca" INTEGER,
    "u_medida" VARCHAR(20),

    CONSTRAINT "Articulo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Deposito" (
    "id" SERIAL NOT NULL,
    "direccion" TEXT NOT NULL,
    "cap_max" INTEGER,

    CONSTRAINT "Deposito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ArticDepos" (
    "id" SERIAL NOT NULL,
    "deposito_id" INTEGER NOT NULL,
    "articulo_id" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "stock_min" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ArticDepos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TipoComprobante" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(60) NOT NULL,
    "observacion" VARCHAR(200),

    CONSTRAINT "TipoComprobante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MovimientoStock" (
    "id" SERIAL NOT NULL,
    "dep_origen_id" INTEGER,
    "dep_destino_id" INTEGER,
    "fecha_hora" TIMESTAMP(3) NOT NULL,
    "tipo" "public"."TipoMovimiento" NOT NULL,
    "num_comprobante" VARCHAR(40),
    "id_tipo_comprobante" INTEGER,

    CONSTRAINT "MovimientoStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DetalleMovimiento" (
    "id" SERIAL NOT NULL,
    "id_movimiento" INTEGER NOT NULL,
    "id_artic_depos" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,

    CONSTRAINT "DetalleMovimiento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Articulo_codigo_key" ON "public"."Articulo"("codigo");

-- AddForeignKey
ALTER TABLE "public"."Articulo" ADD CONSTRAINT "Articulo_id_categoria_fkey" FOREIGN KEY ("id_categoria") REFERENCES "public"."CategoriaArticulo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Articulo" ADD CONSTRAINT "Articulo_id_marca_fkey" FOREIGN KEY ("id_marca") REFERENCES "public"."MarcaArticulo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ArticDepos" ADD CONSTRAINT "ArticDepos_deposito_id_fkey" FOREIGN KEY ("deposito_id") REFERENCES "public"."Deposito"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ArticDepos" ADD CONSTRAINT "ArticDepos_articulo_id_fkey" FOREIGN KEY ("articulo_id") REFERENCES "public"."Articulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MovimientoStock" ADD CONSTRAINT "MovimientoStock_dep_origen_id_fkey" FOREIGN KEY ("dep_origen_id") REFERENCES "public"."Deposito"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MovimientoStock" ADD CONSTRAINT "MovimientoStock_dep_destino_id_fkey" FOREIGN KEY ("dep_destino_id") REFERENCES "public"."Deposito"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MovimientoStock" ADD CONSTRAINT "MovimientoStock_id_tipo_comprobante_fkey" FOREIGN KEY ("id_tipo_comprobante") REFERENCES "public"."TipoComprobante"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DetalleMovimiento" ADD CONSTRAINT "DetalleMovimiento_id_movimiento_fkey" FOREIGN KEY ("id_movimiento") REFERENCES "public"."MovimientoStock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DetalleMovimiento" ADD CONSTRAINT "DetalleMovimiento_id_artic_depos_fkey" FOREIGN KEY ("id_artic_depos") REFERENCES "public"."ArticDepos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
