import { prisma, DBId } from "@/prisma/instance";
import { Result } from "@/util/error_monads";

export class CategoriaData {
  private id: DBId;
  private nombre: string;

  constructor(id: DBId, nombre: string) {
    this.id = id;
    this.nombre = nombre;
  }

  getId(): DBId { return this.id; }
  getNombre(): string { return this.nombre; }
};

export async function retrieveCategorias(): Promise<Array<CategoriaData>> {
  return await prisma.categoriaArticulo.findMany({
    orderBy: { nombre: "asc" },
  })
  .then((cats) => cats.map((cat) => new CategoriaData(cat.id, cat.nombre)));
}

export async function registerCategoria(nombre: string): Promise<Result<CategoriaData>> {
  try {
    let cat = await prisma.categoriaArticulo.create({
      data: { nombre }
    })
    return Result.Some(new CategoriaData(cat.id, cat.nombre));
  } catch (err) {
    return Result.None(new Error(`${err}`));
  }
} 
