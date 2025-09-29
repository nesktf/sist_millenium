import { Maybe, Result } from "@/util/error_monads";
import { prisma, DBId, DBData } from "@/prisma/instance";

export class ArticuloData {
  private codigo: string;
  private nombre: string;
  private categoria: DBData<string> | null;
  private marca: DBData<string> | null;

  constructor(codigo: string, nombre: string,
              categoria: DBData<string> | null, marca: DBData<string> | null)
  {
    this.codigo = codigo;
    this.nombre = nombre;
    this.categoria = categoria;
    this.marca = marca;
  }

  getNombre(): string { return this.nombre; }
  getCodigo(): string { return this.codigo; }

  getCategoria(): string | null { return this.categoria ? this.categoria.data : null ; }
  getCategoriaId(): DBId | null { return this.categoria ? this.categoria.id : null; }

  getMarca(): string | null { return this.marca ? this.marca.data : null; }
  getMarcaId(): DBId | null { return this.marca ? this.marca.id: null; }
}

export async function registerArticulo(articulo: ArticuloData): Promise<Result<DBId>> {
  const categ = articulo.getCategoriaId();
  const marca = articulo.getMarcaId();
  return await prisma.articulo
  .create({
    data: {
      nombre: articulo.getNombre(),
      codigo: articulo.getCodigo(),
      id_categoria: categ ? categ : undefined,
      id_marca: marca ? marca : undefined,
    },
  })
  .then((entry): Result<DBId> => {
    return Result.Some(entry.id);
  })
  .catch((err): Result<DBId> => {
    return Result.None(new Error(`${err}`));
  })
}

type DbMarcaCategData = {
  marca: { id: DBId, nombre: string } | null
  categoria: { id: DBId, nombre: string } | null
};

function artCategMarcaFromDb(art: DbMarcaCategData) {
  const categ = art.categoria ? { id: art.categoria.id, data: art.categoria.nombre} : null;
  const marca = art.marca ? { id: art.marca.id, data: art.marca.nombre } : null;
  return [categ, marca];
}

export async function retrieveArticulo(id: DBId): Promise<Result<ArticuloData>> {
  return await prisma.articulo.findUnique({
    include: {
      marca: true,
      categoria: true
    },
    where: { id }
  })
  .then((art): Result<ArticuloData> => {
    if (art == null) {
      return Result.None(new Error(`Articulo con id ${id} no encontrado`));
    }
    const [categ, marca] = artCategMarcaFromDb(art);
    return Result.Some(new ArticuloData(art.codigo, art.nombre, categ, marca));
  })
  .catch((err): Result<ArticuloData> => {
    return Result.None(new Error(`${err}`));
  })
}

export async function retrieveArticulos(): Promise<Result<Array<DBData<ArticuloData>>>> {
  return await prisma.articulo.findMany({
    include: {
      marca: true,
      categoria: true,
    }
  })
  .then((entries): Result<Array<DBData<ArticuloData>>> => Result.Some(entries.map((entry) => {
    const [categ, marca] = artCategMarcaFromDb(entry);
    const data = new ArticuloData(
      entry.codigo,
      entry.nombre,
      categ, marca
    );
    return { id: entry.id, data };
  })))
  .catch((err): Result<Array<DBData<ArticuloData>>> => {
    return Result.None(new Error(`${err}`));
  });
}

export async function updateArticulo(id: DBId, articulo: ArticuloData): Promise<Maybe<Error>> {
  const categ = articulo.getCategoriaId();
  const marca = articulo.getMarcaId();
  try {
    await prisma.articulo.update({
      where: { id},
      data: {
        nombre: articulo.getNombre(),
        codigo: articulo.getCodigo(),
        id_categoria: categ ? categ : undefined,
        id_marca: marca ? marca : undefined,
      },
    });
    return Maybe.None();
  } catch(err) {
    return Maybe.Some(new Error(`${err}`));
  }
}

export async function deleteArticulo(id: DBId): Promise<Maybe<Error>> {
  try {
    await prisma.articulo.delete({
      where: { id: id },
    });
    return Maybe.None();
  } catch(err) {
    return Maybe.Some(new Error(`${err}`));
  }
}
