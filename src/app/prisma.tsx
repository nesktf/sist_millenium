import assert from "assert";
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
  private id_dst: DBId;
  private tipo: TipoMovimiento;
  private articulos: Array<ArticuloDepositoData>;
  private id_src?: DBId;
  private comprobante?: string;

  private constructor(id_dst: DBId, tipo: TipoMovimiento, articulos: Array<ArticuloDepositoData>,
                      id_src?: DBId | null, comprobante?: string | null) {
    if (articulos.length == 0) {
      throw new Error("Invalid array size");
    }
      this.id_dst = id_dst;
    this.tipo = tipo;
    this.articulos = articulos;
    if (id_src) {
      this.id_src = id_src;
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

  getDeposito(): DBId { return this.id_dst; }
  getTipo(): TipoMovimiento { return this.tipo; }
  getArticulos(): Array<ArticuloDepositoData> { return this.articulos; }
  hasComprobante(): boolean { return this.hasComprobante != null; }
  getComprobante(): string | null { return this.comprobante ? this.comprobante : null; }
  getFuente(): DBId | null { return this.id_src? this.id_src: null; }
};

type RegistroMov = {
  src: { id: DBId, date: Date, } | null,
  dst: { id: DBId, date: Date, }
}

// Update or delete existing artic_depos entry
async function updateArticDeposStock(artic: {id: DBId, stock: number},
                                     deposito: DBId): Promise<DBId | null> {
  let entry = await prisma.articDepos.findFirstOrThrow({
    where: {
      id_deposito: deposito,
      id_articulo: artic.id,
    }
  });

  let new_stock = artic.stock + artic.stock;
  if (new_stock < 0) {
    throw new Error("Invalid stock");
  }

  if (new_stock == 0) {
    // Delete entry
    await prisma.articDepos.delete({
      where: { id: artic.id }
    });
    return null
  }

  // Update stock
  await prisma.articDepos.update({
    where: { id: artic.id },
    data: { stock: new_stock },
  })
  return entry.id;
}

export async function registerMovimiento(movimiento: MovimientoStockData): Promise<RegistroMov> {
  let tipo = movimiento.getTipo();
  let articulos = movimiento.getArticulos();

  const add_artic_depos = async (deposito: DBId) => {
    return await Promise.all(articulos.map(async (articulo) => {
      assert(articulo.getStock() > 0, "Stock inválido");
      let data = {id: articulo.getId(), stock: articulo.getStock()};
      return await updateArticDeposStock(data, deposito);
    }))
    .then((articulos_depos) => {
      return articulos_depos.map((id_artic_depos: number | null, idx: number) => {
        // Solo pueden haberse actualizado o creado entradas
        assert(id_artic_depos != null, "Ingreso no puede eliminar articulos_depos");
        return {
          id_movimiento: dst_entry.id,
          id_artic_depos: id_artic_depos,
          cantidad: articulos[idx].getStock()
        }
      });
    });
  };
  const subs_artic_depos = async (deposito: DBId) => {
    let detalles = await Promise.all(articulos.map(async (articulo) => {
      assert(articulo.getStock() < 0, "Stock inválido");
      let data = {id: articulo.getId(), stock: articulo.getStock()};
      return await updateArticDeposStock(data, deposito);
    }))
    .then((articulos_depos) => {
      return articulos_depos.map((id_artic_depos: number | null, idx: number) => {
        if (id_artic_depos == null) {
          return null;
        }
        // FIXME: Qué detalle crear cuando un artículo en depósito es eliminado?
        return {
          id_movimiento: dst_entry.id,
          id_artic_depos: id_artic_depos,
          cantidad: articulos[idx].getStock(),
        }
      });
    });
    return detalles.filter((detalle) => {
      return detalle != null;
    });
  };

  // 1. Crear entrada de movimiento de depósito
  let dst_deposito = movimiento.getDeposito();
  let date = new Date();
  let dst_entry = await prisma.movimientoStock.create({
    data: {
      fecha_hora: date,
      tipo: tipo,
      id_deposito: dst_deposito,
      num_comprobante: movimiento.getComprobante(),
    }
  });
  var src_entry_out: { id: DBId, date: Date } | null = null;
  if (tipo == TipoMovimiento.INGRESO) {
    // 2. Crear o actualizar artículos en depósitos con más stock
    let detalles = await add_artic_depos(dst_deposito);

    // 3. Crear detalles de movimientos con los artículos de depósito modificados/creados
    await Promise.all(detalles.map(async (detalle) => {
      await prisma.detalleMovimiento.create({data: detalle});
    }));
  } else if (tipo == TipoMovimiento.EGRESO) {
    // 2. Eliminar o actualizar artículos en depósitos con menos stock
    let detalles = await subs_artic_depos(dst_deposito);

    // 3. Crear detalles de movimientos con los artículos de depósito modificados
    await Promise.all(detalles.map(async (detalle) => {
      await prisma.detalleMovimiento.create({data: detalle});
    }));
  } else if (tipo == TipoMovimiento.TRANSFERENCIA) {
    // 2. Crear otro movimiento para el depósito fuente
    let src_deposito = movimiento.getFuente();
    assert(src_deposito != null);
    let src_entry = await prisma.movimientoStock.create({
      data: {
        fecha_hora: date,
        tipo: tipo,
        id_deposito: src_deposito,
        num_comprobante: movimiento.getComprobante(),
      }
    })
    src_entry_out = { id: src_entry.id, date: date};

    // 3. Eliminar o actualizar artículos en el depósito fuente
    let src_detalles = await subs_artic_depos(src_deposito);

    // 4. crear o actualizar artículos en el depósito destino
    let dst_detalles = await add_artic_depos(dst_deposito);

    // 5. Cargar todos los detalles
    await Promise.all(src_detalles.map(async (detalle) => {
      await prisma.detalleMovimiento.create({data: detalle});
    }));
    await Promise.all(dst_detalles.map(async (detalle) => {
      await prisma.detalleMovimiento.create({data: detalle});
    }));
  }

  return { src: src_entry_out, dst: { id: dst_entry.id, date: dst_entry.fecha_hora } };
}

