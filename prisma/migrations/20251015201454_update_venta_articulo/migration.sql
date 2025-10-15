-- CreateEnum
CREATE TYPE "public"."MetodoPagoCliente" AS ENUM ('TARJETA_CREDITO', 'TARJETA_DEBITO');
-- AlterTable
ALTER TABLE "public"."VentaArticulo" 
ADD COLUMN     "apellido_contacto" TEXT NOT NULL,
ADD COLUMN     "correo_contacto" TEXT NOT NULL,
ADD COLUMN     "metodo_pago" "public"."MetodoPagoCliente" NOT NULL,
ADD COLUMN     "nombre_contacto" TEXT NOT NULL,
ADD COLUMN     "telefono_contacto" TEXT NOT NULL;