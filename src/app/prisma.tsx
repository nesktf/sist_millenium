import { PrismaClient } from "../generated/prisma"

const prisma = new PrismaClient();

export async function getProducts() {
  const prods = await prisma.articulo.findMany();
  return prods;
}
