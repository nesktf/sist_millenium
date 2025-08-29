import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

//Devolver productos
export async function getProducts() {
  return await prisma.articulo.findMany({
    include: {
      categoria: true,
      marca: true,
    },
  });
}

//Agregar Producto
export async function createArticulo(data: {
  codigo: string;
  nombre: string;
  id_categoria?: number;
  id_marca?: number;
  u_medida?: string;
}) {
  return await prisma.articulo.create({
    data,
  });
}
