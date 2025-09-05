import assert from "assert";
import { PrismaClient, TipoMovimiento } from "../generated/prisma";

const prisma = new PrismaClient();
export default prisma;

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

  constructor(id_dst: DBId, tipo: TipoMovimiento, articulos: Array<ArticuloDepositoData>,
              comprobante?: string | null, id_src?: DBId | null)  {
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

  public static fromTransfer(to: DBId, from: DBId, comprobante: string,
                             articulos: Array<ArticuloDepositoData>): MovimientoStockData {
    return new MovimientoStockData(to, TipoMovimiento.TRANSFERENCIA, articulos, comprobante, from);
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
                                     deposito: DBId): Promise<DBId> {
  var entry = await prisma.articDepos.findFirst({
    where: {
      deposito_id: deposito,
      articulo_id: artic.id,
    }
  });
  if (!entry) {
    let new_stock = artic.stock;
    if (new_stock < 0) {
      throw new Error("Invalid stock");
    }
    entry = await prisma.articDepos.create({
      data: {
        deposito_id: deposito,
        articulo_id: artic.id,
        stock: artic.stock,
      }
    })
    return entry.id;
  } else {
    let new_stock = entry.stock + artic.stock;
    if (new_stock < 0) {
      throw new Error("Invalid stock");
    }

    // Update stock
    await prisma.articDepos.update({
      where: { id: entry.id },
      data: { stock: new_stock },
    })
    return entry.id;
  }
}

export async function registerMovimiento(movimiento: MovimientoStockData): Promise<RegistroMov> {
  let tipo = movimiento.getTipo();
  let articulos = movimiento.getArticulos();
  // TODO: Chequear capacidad del depósito
  // let total_things = articulos.reduce((prev, next) => {
  //   return next.getStock();
  // }, 0);

  const add_artic_depos = async (deposito: DBId, id_mov: DBId) => {
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
          id_movimiento: id_mov,
          id_artic_depos: id_artic_depos,
          cantidad: articulos[idx].getStock()
        }
      });
    });
  };
  const subs_artic_depos = async (deposito: DBId, id_mov: DBId) => {
    let detalles = await Promise.all(articulos.map(async (articulo) => {
      let count = -articulo.getStock();
      assert(count < 0, "Stock inválido");
      let data = {id: articulo.getId(), stock: count};
      return await updateArticDeposStock(data, deposito);
    }))
    .then((articulos_depos) => {
      return articulos_depos.map((id_artic_depos: number | null, idx: number) => {
        if (id_artic_depos == null) {
          return null;
        }
        // FIXME: Qué detalle crear cuando un artículo en depósito es eliminado?
        return {
          id_movimiento: id_mov,
          id_artic_depos: id_artic_depos,
          cantidad: -articulos[idx].getStock(),
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
      dep_destino_id: dst_deposito,
      num_comprobante: movimiento.getComprobante(),
    }
  });
  var src_entry_out: { id: DBId, date: Date } | null = null;
  try {
    if (tipo == TipoMovimiento.INGRESO) {
      // 2. Crear o actualizar artículos en depósitos con más stock
      let detalles = await add_artic_depos(dst_deposito, dst_entry.id);

      // 3. Crear detalles de movimientos con los artículos de depósito modificados/creados
      await Promise.all(detalles.map(async (detalle) => {
        await prisma.detalleMovimiento.create({data: detalle});
      }));
    } else if (tipo == TipoMovimiento.EGRESO) {
      // 2. Actualizar artículos en depósitos con menos stock
      let detalles = await subs_artic_depos(dst_deposito, dst_entry.id);

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
          dep_origen_id: src_deposito,
          num_comprobante: movimiento.getComprobante()+"-SRC",
        }
      })
      src_entry_out = { id: src_entry.id, date: date};

      // 3. Actualizar artículos en el depósito fuente
      let src_detalles = await subs_artic_depos(src_deposito, src_entry.id);
      console.log(src_detalles);

      // 4. Crear o actualizar artículos en el depósito destino
      let dst_detalles = await add_artic_depos(dst_deposito, dst_entry.id);
      console.log(dst_detalles);

      // 5. Cargar todos los detalles
      await Promise.all(src_detalles.map(async (detalle) => {
        await prisma.detalleMovimiento.create({data: detalle});
      }));
      await Promise.all(dst_detalles.map(async (detalle) => {
        await prisma.detalleMovimiento.create({data: detalle});
      }));
    }
  } catch (err: any) {
    if (src_entry_out != null) {
      await prisma.movimientoStock.delete({
        where: { id: src_entry_out.id }
      });
    }
    await prisma.movimientoStock.delete({
      where: { id: dst_entry.id }
    });
    throw err;
  }

  return { src: src_entry_out, dst: { id: dst_entry.id, date: dst_entry.fecha_hora } };
}

export async function retrieveMovimientos(deposito: DBId) {
  let movs = await prisma.movimientoStock.findMany(({
    where: { dep_origen_id: deposito },
  }));
  let mov_detalles = await Promise.all(movs.map(async (mov) => {
    return await prisma.detalleMovimiento.findMany({
      where: { id_movimiento: mov.id}
    });
  }));
  let mov_articulos = await Promise.all(mov_detalles.map(async (mov_detalle) => {
    let artic_depos = await Promise.all(mov_detalle.map(async (detalle) => {
      return await prisma.articDepos.findUniqueOrThrow({
        where: { id: detalle.id_artic_depos }
      });
    }));
    let articulos = await Promise.all(artic_depos.map(async (artic) => {
      return await prisma.articulo.findUniqueOrThrow({
        where: { id: artic.articulo_id }
      });
    }));
    return articulos.map((articulo) => {
      return { id: articulo.id, codigo: articulo.codigo, nombre: articulo.nombre };
    });
  })); 
  return movs.map((mov, idx_mov: number) => {
    return {
      fecha: mov.fecha_hora,
      tipo: mov.tipo,
      comprobante: mov.num_comprobante,
      articulos: mov_detalles[idx_mov].map((detalle, idx_det: number) => {
        let articulo = mov_articulos[idx_mov][idx_det];
        return {
          id_articulo: articulo.id,
          nombre: articulo.nombre,
          codigo: articulo.codigo,
          cantidad: detalle.cantidad,
        }
      }),
    }
  });
}
