/*
  Warnings:

  - A unique constraint covering the columns `[correo]` on the table `UserEcommerce` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserEcommerce_correo_key" ON "public"."UserEcommerce"("correo");
