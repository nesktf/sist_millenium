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

export async function updateArticulo(id: number, data: any) {
  return await prisma.articulo.update({
    where: { id },
    data,
  });
}

export async function deleteArticulo(id: number) {
  return await prisma.articulo.delete({
    where: { id },
  });
}
