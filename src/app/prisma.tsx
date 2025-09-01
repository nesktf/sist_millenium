import { PrismaClient, TipoMovimiento } from "../generated/prisma";

const prisma = new PrismaClient();

type DBId = number;
type DBData<T> = {id: DBId, data: T};

export class ArticuloData {
  private codigo: string;
  private nombre: string;
  private id_categoria?: DBId;
  private id_marca?: DBId;

  constructor(codigo: string, nombre: string,
              id_categoria?: number | null, id_marca?: number | null)
  {
    this.codigo = codigo;
    this.nombre = nombre;
    if (id_categoria) {
      this.id_categoria = id_categoria;
    }
    if (id_marca) {
      this.id_marca = id_marca;
    }
  }

  getNombre(): string { return this.nombre; }
  getCodigo(): string { return this.codigo; }
  getCategoriaId(): DBId | null { return this.id_categoria ? this.id_categoria : null; }
  getMarcaId(): DBId | null { return this.id_marca ? this.id_marca : null; }
};

export async function registerArticulo(articulo: ArticuloData): Promise<DBId> {
  return await prisma.articulo.create({
    data: {
      nombre: articulo.getNombre(),
      codigo: articulo.getCodigo(),
      id_categoria: articulo.getCategoriaId(),
      id_marca: articulo.getMarcaId(),
    }
  })
  .then((entry): DBId => {
    return entry.id;
  })
}

export async function retrieveArticulos(): Promise<Array<DBData<ArticuloData>>> {
  return await prisma.articulo.findMany()
  .then((entries) => {
    return entries.map((entry) => {
      let data = new ArticuloData(entry.codigo, entry.nombre,
                                  entry.id_categoria, entry.id_marca);
      return {id: entry.id, data: data};
    });
  });
}

export async function updateArticulo(entry: DBData<ArticuloData>) {
  await prisma.articulo.update({
    where: { id: entry.id },
    data: {
      nombre: entry.data.getNombre(),
      codigo: entry.data.getCodigo(),
      id_marca: entry.data.getMarcaId(),
      id_categoria: entry.data.getCategoriaId(),
    }
  })
}

export async function deleteArticulo(id: DBId) {
  await prisma.articulo.delete({
    where: { id: id },
  });
}

export class DepositoData {
  private direccion: string;
  private capMax?: number;

  constructor(direccion: string, capMax?: number | null) {
    this.direccion = direccion;
    if (capMax) {
      this.capMax = Math.round(capMax);
    }
  }

  getDireccion(): string { return this.direccion; }
  hasCap(): boolean { return this.capMax == null; }
  getCap(): number | undefined { return this.capMax; }
}

export async function registerDeposito(data: DepositoData): Promise<DBId> {
  return await prisma.deposito.create({
    data: {
      direccion: data.getDireccion(),
      cap_max: data.getCap(),
    }
  })
  .then((entry): DBId => {
    return entry.id;
  })
}

export async function retrieveDepositos(): Promise<Array<DBData<DepositoData>>> {
  return await prisma.deposito.findMany()
  .then((entries) => {
    return entries.map((entry) => {
      return {id: entry.id, data: new DepositoData(entry.direccion, entry.cap_max)};
    });
  });
}

export async function findDeposito(id: DBId): Promise<DepositoData> {
  return await prisma.deposito.findUniqueOrThrow({
    where: { id: id }
  })
  .then((entry): DepositoData => {
    return new DepositoData(entry.direccion, entry.cap_max);
  });
}

export class ArticuloDepositoData {
  private articulo: DBId;
  private stock: number;

  constructor(articulo: DBId, stock: number) {
    this.articulo = articulo;
    this.stock = Math.round(stock);
  }

  getId(): DBId { return this.articulo; }
  getStock(): number { return this.stock; }
};

export class MovimientoStockData {
  private id_src: DBId;
  private tipo: TipoMovimiento;
  private articulos: Array<ArticuloDepositoData>;
  private id_dst?: DBId;
  private comprobante?: string;

  private constructor(id_src: DBId, tipo: TipoMovimiento, articulos: Array<ArticuloDepositoData>,
                      id_dst?: DBId | null, comprobante?: string | null) {
    if (articulos.length == 0) {
      throw new Error("Invalid array size");
    }
    this.id_src = id_src;
    this.tipo = tipo;
    this.articulos = articulos;
    if (id_dst) {
      this.id_dst = id_dst;
    }
    if (comprobante) {
      this.comprobante = comprobante;
    }
  }

  public static fromIngreso(deposito: DBId, comprobante: string,
                            articulos: Array<ArticuloDepositoData>): MovimientoStockData {
    return new MovimientoStockData(deposito, TipoMovimiento.INGRESO, articulos, null, comprobante);
  }
  public static fromEgreso(deposito: DBId, comprobante: string,
                           articulos: Array<ArticuloDepositoData>): MovimientoStockData {
    return new MovimientoStockData(deposito, TipoMovimiento.EGRESO, articulos, null, comprobante);
  }
  public static fromTransfer(from: DBId, to: DBId,
                             articulos: Array<ArticuloDepositoData>): MovimientoStockData {
    return new MovimientoStockData(from, TipoMovimiento.TRANSFERENCIA, articulos, to, null);
  }

  getDeposito(): DBId { return this.id_src; }
  getTipo(): TipoMovimiento { return this.tipo; }
  getArticulos(): Array<ArticuloDepositoData> { return this.articulos; }
  hasComprobante(): boolean { return this.hasComprobante != null; }
  getComprobante(): string | null { return this.comprobante ? this.comprobante : null; }
  getDestino(): DBId | null { return this.id_dst ? this.id_dst : null; }
};

async function findOrLoadArticDepos(deposito: DBId,
                                    articulos: Array<ArticuloDepositoData>): Promise<Array<DBId>> {
  return await Promise.all(articulos.map(async (articulo) => {
    let artic_depos_entry = await prisma.articDepos.findFirst({
      where: {
        id_deposito: deposito,
        id_articulo: articulo.getId(),
      }
    });
    if (artic_depos_entry) {
      return artic_depos_entry.id;
    } else {
      return await prisma.articDepos.create({
        data: {
          id_deposito: deposito,
          id_articulo: articulo.getId(),
          stock: articulo.getStock(),
          stock_min: 10000, // FIXME: Where do i get this from?
        }
      })
      .then((entry): DBId => {
        return entry.id;
      })
    }
  }));
}

type RegistroMov = {
  src: { id: DBId, date: Date, } | null,
  dst: { id: DBId, date: Date, }
}

export async function registerMovimiento(movimiento: MovimientoStockData): Promise<RegistroMov> {
  let tipo = movimiento.getTipo();
  let deposito = movimiento.getDeposito();
  let articulos = movimiento.getArticulos();

  let dst_entry = await prisma.movimientoStock.create({
    data: {
      fecha_hora: new Date(),
      tipo: tipo,
      id_deposito: deposito,
      num_comprobante: movimiento.getComprobante(),
    }
  });
  var src_entry: { id: DBId, date: Date } | null = null;

  if (tipo == TipoMovimiento.INGRESO) {
    let detalles = await findOrLoadArticDepos(deposito, articulos)
    .then((articulos_depos) => {
      return articulos_depos.map((id_artic_depos, idx: number) => {
        return {
          id_movimiento: dst_entry.id,
          id_artic_depos: id_artic_depos,
          cantidad: articulos[idx].getStock()
        }
      });
    });

    await Promise.all(detalles.map(async (detalle) => {
      await prisma.detalleMovimiento.create({data: detalle});
    }));
  } else if (tipo == TipoMovimiento.EGRESO) {

  } else if (tipo == TipoMovimiento.TRANSFERENCIA) {

  }

  return { src: src_entry, dst: { id: dst_entry.id, date: dst_entry.fecha_hora } };
}

