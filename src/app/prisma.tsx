import assert from "assert";
import {
  EstadoProveedor,
  FormaDePago,
  PrismaClient,
  NaturalezaMovimiento,
} from "../generated/prisma";

const prisma = new PrismaClient();
export default prisma;

type DBId = number;
type DBData<T> = { id: DBId; data: T };

export class ArticuloData {
  private codigo: string;
  private nombre: string;
  private id_categoria?: DBId;
  private id_marca?: DBId;

  constructor(
    codigo: string,
    nombre: string,
    id_categoria?: number | null,
    id_marca?: number | null
  ) {
    this.codigo = codigo;
    this.nombre = nombre;
    if (id_categoria) {
      this.id_categoria = id_categoria;
    }
    if (id_marca) {
      this.id_marca = id_marca;
    }
  }

  getNombre(): string {
    return this.nombre;
  }
  getCodigo(): string {
    return this.codigo;
  }
  getCategoriaId(): DBId | null {
    return this.id_categoria ? this.id_categoria : null;
  }
  getMarcaId(): DBId | null {
    return this.id_marca ? this.id_marca : null;
  }
}

export async function registerArticulo(articulo: ArticuloData): Promise<DBId> {
  return await prisma.articulo
    .create({
      data: {
        nombre: articulo.getNombre(),
        codigo: articulo.getCodigo(),
        id_categoria: articulo.getCategoriaId(),
        id_marca: articulo.getMarcaId(),
      },
    })
    .then((entry): DBId => {
      return entry.id;
    });
}

export async function retrieveArticulo(id: DBId): Promise<ArticuloData | null> {
  try {
    return await prisma.articulo
      .findUniqueOrThrow({ where: { id } })
      .then(
        (art) =>
          new ArticuloData(
            art.codigo,
            art.nombre,
            art.id_categoria,
            art.id_marca
          )
      );
  } catch (error) {
    console.log(`Error @ retrieveArticulo: ${error}`);
    return null;
  }
}

export async function retrieveArticulos() {
  return await prisma.articulo
    .findMany({
      include: {
        marca: true,
        categoria: true,
      },
    })
    .then((entries) => {
      return entries.map((entry) => {
        let data = new ArticuloData(
          entry.codigo,
          entry.nombre,
          entry.id_categoria,
          entry.id_marca
        );
        return {
          id: entry.id,
          data: data,
          marca: entry.marca,
          categoria: entry.categoria,
        };
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
    },
  });
}

export async function deleteArticulo(id: DBId) {
  await prisma.articulo.delete({
    where: { id: id },
  });
}

export class DepositoData {
  private nombre: string;
  private direccion: string;
  private capMax?: number;

  constructor(nombre: string, direccion: string, capMax?: number | null) {
    this.nombre = nombre;
    this.direccion = direccion;
    if (capMax) {
      this.capMax = Math.round(capMax);
    }
  }

  getNombre(): string {
    return this.nombre;
  }
  getDireccion(): string {
    return this.direccion;
  }
  hasCap(): boolean {
    return this.capMax == null;
  }
  getCap(): number | undefined {
    return this.capMax;
  }
}

export async function registerDeposito(data: DepositoData): Promise<DBId> {
  return await prisma.deposito
    .create({
      data: {
        nombre: data.getNombre(),
        direccion: data.getDireccion(),
        cap_max: data.getCap(),
      },
    })
    .then((entry): DBId => {
      return entry.id;
    });
}

export async function retrieveDepositos(): Promise<
  Array<DBData<DepositoData>>
> {
  return await prisma.deposito.findMany().then((entries) => {
    return entries.map((entry) => {
      return {
        id: entry.id,
        data: new DepositoData(entry.nombre, entry.direccion, entry.cap_max),
      };
    });
  });
}

export async function findDeposito(id: DBId): Promise<DepositoData> {
  return await prisma.deposito
    .findUniqueOrThrow({
      where: { id: id },
    })
    .then((entry): DepositoData => {
      return new DepositoData(entry.nombre, entry.direccion, entry.cap_max);
    });
}

export class ArticuloDepositoData {
  private id: DBId;
  private stock: number;

  constructor(id: DBId, stock: number) {
    if (stock <= 0) throw new Error("Stock inválido");
    this.id = id;
    this.stock = stock;
  }

  getId(): DBId {
    return this.id;
  }

  getStock(): number {
    return this.stock;
  }
}

export class MovimientoStockData {
  private id_dst: DBId;
  private articulos: Array<ArticuloDepositoData>;
  private id_src?: DBId;
  private comprobante?: string;

  constructor(
    id_dst: DBId,
    articulos: Array<ArticuloDepositoData>,
    comprobante?: string | null,
    id_src?: DBId | null
  ) {
    if (articulos.length === 0) throw new Error("Invalid array size");
    this.id_dst = id_dst;
    this.articulos = articulos;
    if (id_src) this.id_src = id_src;
    if (comprobante) this.comprobante = comprobante;
  }

  public static fromTransfer(
    to: DBId,
    from: DBId,
    comprobante: string,
    articulos: Array<ArticuloDepositoData>
  ): MovimientoStockData {
    return new MovimientoStockData(to, articulos, comprobante, from);
  }

  getDeposito(): DBId {
    return this.id_dst;
  }

  getArticulos(): Array<ArticuloDepositoData> {
    return this.articulos;
  }

  getComprobante(): string | null {
    return this.comprobante ?? null;
  }

  getFuente(): DBId | null {
    return this.id_src ?? null;
  }

  hasFuente(): boolean {
    return this.id_src != null;
  }
}

type RegistroMov = {
  src: { id: DBId; date: Date } | null;
  dst: { id: DBId; date: Date };
};

// Update or delete existing artic_depos entry
async function updateArticDeposStock(
  artic: { id: DBId; stock: number },
  deposito: DBId
): Promise<DBId> {
  var entry = await prisma.articDepos.findFirst({
    where: {
      id_deposito: deposito,
      id_articulo: artic.id,
    },
  });
  if (!entry) {
    let new_stock = artic.stock;
    if (new_stock < 0) {
      throw new Error("Invalid stock");
    }
    entry = await prisma.articDepos.create({
      data: {
        id_deposito: deposito,
        id_articulo: artic.id,
        stock: artic.stock,
      },
    });
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
    });
    return entry.id;
  }
}

export async function registerMovimiento(
  movimiento: MovimientoStockData,
  tipoOperacionNombre: string
): Promise<RegistroMov> {
  // 1. Buscar tipoOperacion por nombre
  const tipoOperacion = await prisma.tipoOperacion.findUnique({
    where: { nombre: tipoOperacionNombre },
  });
  if (!tipoOperacion) throw new Error("TipoOperacion no encontrado");

  const naturaleza = tipoOperacion.naturaleza; // INGRESO | EGRESO

  const updateArticDeposStock = async (
    artic: { id: DBId; stock: number },
    deposito: DBId
  ): Promise<DBId> => {
    let entry = await prisma.articDepos.findFirst({
      where: { id_deposito: deposito, id_articulo: artic.id },
    });

    if (!entry) {
      if (artic.stock < 0) throw new Error("Stock inválido");
      entry = await prisma.articDepos.create({
        data: {
          id_deposito: deposito,
          id_articulo: artic.id,
          stock: artic.stock,
        },
      });
      return entry.id;
    } else {
      const new_stock = entry.stock + artic.stock;
      if (new_stock < 0) throw new Error("Stock inválido");
      await prisma.articDepos.update({
        where: { id: entry.id },
        data: { stock: new_stock },
      });
      return entry.id;
    }
  };

  const add_artic_depos = async (deposito: DBId, id_mov: DBId) => {
    return await Promise.all(
      movimiento.getArticulos().map(async (articulo) => {
        const data = { id: articulo.getId(), stock: articulo.getStock() };
        const id_artic_depos = await updateArticDeposStock(data, deposito);
        return {
          id_movimiento: id_mov,
          id_artic_depos,
          cantidad: articulo.getStock(),
        };
      })
    );
  };

  const subs_artic_depos = async (deposito: DBId, id_mov: DBId) => {
    return (
      await Promise.all(
        movimiento.getArticulos().map(async (articulo) => {
          const count = -articulo.getStock();
          const data = { id: articulo.getId(), stock: count };
          const id_artic_depos = await updateArticDeposStock(data, deposito);
          return {
            id_movimiento: id_mov,
            id_artic_depos,
            cantidad: count,
          };
        })
      )
    ).filter((d) => d != null);
  };

  const dst_deposito = movimiento.getDeposito();
  const date = new Date();

  // Crear movimiento destino
  const dst_entry = await prisma.movimientoStock.create({
    data: {
      fecha_hora: date,
      id_deposito: dst_deposito,
      id_tipo_operacion: tipoOperacion.id,
      num_comprobante: movimiento.getComprobante(),
    },
  });

  let src_entry_out: { id: DBId; date: Date } | null = null;

  try {
    if (naturaleza === "INGRESO") {
      const detalles = await add_artic_depos(dst_deposito, dst_entry.id);
      await Promise.all(
        detalles.map((d) => prisma.detalleMovimiento.create({ data: d }))
      );
    } else if (naturaleza === "EGRESO") {
      const detalles = await subs_artic_depos(dst_deposito, dst_entry.id);
      await Promise.all(
        detalles.map((d) => prisma.detalleMovimiento.create({ data: d }))
      );
    } else {
      // Si quieres transferencias explícitas
      if (movimiento.hasFuente()) {
        const src_deposito = movimiento.getFuente()!;
        // Crear movimiento fuente
        const src_entry = await prisma.movimientoStock.create({
          data: {
            fecha_hora: date,
            id_deposito: src_deposito,
            id_tipo_operacion: tipoOperacion.id,
            num_comprobante: movimiento.getComprobante() + "-SRC",
          },
        });
        src_entry_out = { id: src_entry.id, date };
        const src_detalles = await subs_artic_depos(src_deposito, src_entry.id);
        await Promise.all(
          src_detalles.map((d) => prisma.detalleMovimiento.create({ data: d }))
        );

        const dst_detalles = await add_artic_depos(dst_deposito, dst_entry.id);
        await Promise.all(
          dst_detalles.map((d) => prisma.detalleMovimiento.create({ data: d }))
        );
      } else {
        throw new Error("Naturaleza desconocida y sin fuente");
      }
    }
  } catch (err: any) {
    if (src_entry_out) {
      await prisma.movimientoStock.delete({ where: { id: src_entry_out.id } });
    }
    await prisma.movimientoStock.delete({ where: { id: dst_entry.id } });
    throw err;
  }

  return {
    src: src_entry_out,
    dst: { id: dst_entry.id, date: dst_entry.fecha_hora },
  };
}

export async function retrieveMovimientos(
  deposito: DBId,
  articulo: DBId | null
) {
  let movs = await prisma.movimientoStock.findMany({
    where: { id_deposito: deposito },
  });
  let mov_detalles = await Promise.all(
    movs.map(async (mov) => {
      return await prisma.detalleMovimiento.findMany({
        where: { id_movimiento: mov.id },
      });
    })
  );
  let mov_articulos = await Promise.all(
    mov_detalles.map(async (mov_detalle) => {
      let artic_depos = await Promise.all(
        mov_detalle.map(async (detalle) => {
          return await prisma.articDepos.findUniqueOrThrow({
            where: { id: detalle.id_artic_depos },
          });
        })
      );
      let articulos = await Promise.all(
        artic_depos.map(async (artic) => {
          return await prisma.articulo.findUniqueOrThrow({
            where: { id: artic.id_articulo },
          });
        })
      );
      return articulos.map((articulo) => {
        return {
          id: articulo.id,
          codigo: articulo.codigo,
          nombre: articulo.nombre,
        };
      });
    })
  );
  let parsed_things = movs.map((mov, idx_mov: number) => {
    return {
      id: mov.id, // 👈 agregar esto
      fecha: mov.fecha_hora,
      tipo: mov.id_tipo_operacion,
      comprobante: mov.num_comprobante,
      articulos: mov_detalles[idx_mov].map((detalle, idx_det: number) => {
        let articulo = mov_articulos[idx_mov][idx_det];
        return {
          id_articulo: articulo.id,
          nombre: articulo.nombre,
          codigo: articulo.codigo,
          cantidad: detalle.cantidad,
        };
      }),
    };
  });
  if (articulo) {
    console.log(articulo);
    return parsed_things.filter((mov) => {
      let things = mov.articulos.filter((artic) => {
        return artic.id_articulo == articulo;
      });
      return things.length > 0;
    });
  } else {
    return parsed_things;
  }
}

// PROVEEDORES

export class ProveedorData {
  private nombre: string;
  private cuit: string;
  private razon_Social: string;
  private domicilio: string;
  private email: string;
  private estado: EstadoProveedor;

  constructor(
    nombre: string,
    cuit: string,
    razon_Social: string,
    domicilio: string,
    email: string,
    estado: string
  ) {
    this.nombre = nombre;
    this.cuit = cuit;
    this.razon_Social = razon_Social;
    this.domicilio = domicilio;
    this.email = email;
    // Validar que el estado recibido sea válido y asignarlo
    if (estado.toUpperCase() === "ACTIVO") {
      this.estado = EstadoProveedor.ACTIVO;
    } else if (estado.toUpperCase() === "INACTIVO") {
      this.estado = EstadoProveedor.INACTIVO;
    } else {
      // Por si llega algo inválido, asignar un default
      this.estado = EstadoProveedor.ACTIVO;
    }
  }

  getNombreProv(): string {
    return this.nombre;
  }
  getCuit(): string {
    return this.cuit;
  }
  getRazonSocial(): string {
    return this.razon_Social;
  }
  getDomicilio(): string {
    return this.domicilio;
  }
  getEmail(): string {
    return this.email;
  }
  getEstado(): EstadoProveedor {
    return this.estado;
  }
}

export async function retrieveProveedor() {
  return await prisma.proveedor.findMany({}).then((entries) => {
    return entries.map((entry) => {
      let data = new ProveedorData(
        entry.nombre,
        entry.cuit,
        entry.razon_social,
        entry.domicilio,
        entry.email,
        entry.estado
      );
      return {
        id: entry.id,
        data: data,
        nombre: entry.nombre,
        cuit: entry.cuit,
        razon_social: entry.razon_social,
        domicilio: entry.domicilio,
        email: entry.email,
        estado: entry.estado,
      };
    });
  });
}

export async function registerProveedor(
  proveedor: ProveedorData
): Promise<DBId> {
  return await prisma.proveedor
    .create({
      data: {
        nombre: proveedor.getNombreProv(),
        cuit: proveedor.getCuit(),
        razon_social: proveedor.getRazonSocial(),
        domicilio: proveedor.getDomicilio(),
        email: proveedor.getEmail(),
        estado: proveedor.getEstado(),
      },
    })
    .then((entry): DBId => {
      return entry.id;
    });
}

export async function updateProveedor(entry: DBData<ProveedorData>) {
  await prisma.proveedor.update({
    where: { id: entry.id },
    data: {
      nombre: entry.data.getNombreProv(),
      cuit: entry.data.getCuit(),
      razon_social: entry.data.getRazonSocial(),
      domicilio: entry.data.getDomicilio(),
      email: entry.data.getEmail(),
      estado: entry.data.getEstado(),
    },
  });
}

export async function deleteProveedor(id: DBId) {
  await prisma.proveedor.delete({
    where: { id: id },
  });
}

// DEPOSITOs

export class DepositoDatas {
  private nombre: string;
  private direccion: string;
  private cap_max: number;

  constructor(nombre: string, direccion: string, cap_max: number) {
    this.nombre = nombre;
    this.direccion = direccion;
    this.cap_max = cap_max;
  }

  getNombre(): string {
    return this.nombre;
  }
  getDireccion(): string {
    return this.direccion;
  }
  getCapMax(): number {
    return this.cap_max;
  }
}

export async function retrieveDeposito() {
  return await prisma.deposito.findMany({}).then((entries) => {
    return entries.map((entry) => {
      let data = new DepositoDatas(
        entry.nombre,
        entry.direccion,
        entry.cap_max ?? 0
      );
      return {
        id: entry.id,
        data: data,
        nombre: entry.nombre,
        cuit: entry.direccion,
        razon_social: entry.cap_max,
      };
    });
  });
}

export async function registerDepositos(
  deposito: DepositoDatas
): Promise<DBId> {
  return await prisma.deposito
    .create({
      data: {
        nombre: deposito.getNombre(),
        direccion: deposito.getDireccion(),
        cap_max: deposito.getCapMax(),
      },
    })
    .then((entry): DBId => {
      return entry.id;
    });
}

export async function updateDeposito(entry: DBData<DepositoDatas>) {
  await prisma.deposito.update({
    where: { id: entry.id },
    data: {
      nombre: entry.data.getNombre(),
      direccion: entry.data.getDireccion(),
      cap_max: entry.data.getCapMax(),
    },
  });
}

export async function deleteDeposito(id: DBId) {
  await prisma.deposito.delete({
    where: { id: id },
  });
}

export type ItemOrdenCompra = {
  id: DBId;
  precio: number;
  cantidad: number;
};

export class OrdenCompraData {
  forma_pago: FormaDePago;
  saldo: number;
  total: number;
  items: Array<ItemOrdenCompra>;

  private constructor(
    forma_pago: FormaDePago,
    saldo: number,
    total: number,
    items: Array<ItemOrdenCompra>
  ) {
    this.forma_pago = forma_pago;
    this.saldo = saldo;
    this.total = total;
    this.items = items;
  }

  getFormaPago(): FormaDePago {
    return this.forma_pago;
  }
  getTotal(): number {
    return this.total;
  }
  getSaldo(): number {
    return this.saldo;
  }
  getItems(): Array<ItemOrdenCompra> {
    return this.items;
  }

  static fromItems(
    forma_pago: FormaDePago,
    items: Array<ItemOrdenCompra>
  ): OrdenCompraData {
    let total = items.reduce(
      (total, curr) => total + curr.precio * curr.cantidad,
      0
    );
    return new OrdenCompraData(forma_pago, total, total, items);
  }
  static fromDBEntry({
    forma_pago,
    saldo,
    total,
    items,
  }: {
    forma_pago: FormaDePago;
    saldo: number;
    total: number;
    items: Array<ItemOrdenCompra>;
  }) {
    return new OrdenCompraData(forma_pago, saldo, total, items);
  }
}

export async function registerOrdenCompra(
  orden: OrdenCompraData
): Promise<DBId | null> {
  try {
    const trans_res = await prisma.$transaction(async (tx) => {
      const orden_entry = await tx.ordenCompra.create({
        data: {
          precio_total: orden.getTotal(),
          forma_pago: orden.getFormaPago(),
          saldo: orden.getTotal(),
        },
      });
      await tx.detalleOrdenCompra.createMany({
        data: orden.getItems().map((item) => {
          return {
            id_orden: orden_entry.id,
            id_articulo: item.id,
            precio: item.precio,
            cantidad: item.cantidad,
          };
        }),
      });
      return orden_entry;
    });
    return trans_res.id;
  } catch (err) {
    console.log(`Error @ registerOrdenCompra: ${err}`);
    return null;
  }
}

export async function retrieveOrdenesCompra(): Promise<
  Array<DBData<OrdenCompraData>>
> {
  try {
    return await prisma.ordenCompra
      .findMany({ include: { detalle: true } })
      .then((ordenes) =>
        ordenes.map((orden) => {
          return {
            id: orden.id,
            data: OrdenCompraData.fromDBEntry({
              forma_pago: orden.forma_pago,
              saldo: orden.saldo,
              total: orden.precio_total,
              items: orden.detalle.map((item) => {
                return {
                  id: item.id,
                  precio: item.precio,
                  cantidad: item.cantidad,
                };
              }),
            }),
          };
        })
      );
  } catch (err) {
    console.log(`Error @ retrieveOrdenesCompra: ${err}`);
    return [];
  }
}

export async function retrieveOrdenCompra(
  id: DBId
): Promise<DBData<OrdenCompraData> | null> {
  try {
    return await prisma.ordenCompra
      .findUniqueOrThrow({
        where: { id },
        include: {
          detalle: true,
        },
      })
      .then((orden) => {
        return {
          id: orden.id,
          data: OrdenCompraData.fromDBEntry({
            forma_pago: orden.forma_pago,
            saldo: orden.saldo,
            total: orden.precio_total,
            items: orden.detalle.map((item) => {
              return {
                id: item.id,
                precio: item.precio,
                cantidad: item.cantidad,
              };
            }),
          }),
        };
      });
  } catch (err) {
    console.log(`Error @ retrieveOrdenCompra: ${err}`);
    return null;
  }
}

export async function updateOrdenCompraSaldo(
  id: DBId,
  saldo: number
): Promise<boolean> {
  try {
    await prisma.ordenCompra.update({
      where: { id },
      data: { saldo },
    });
    return true;
  } catch (err) {
    console.log(`Error @ updateOrdenCompraSaldo: ${err}`);
    return false;
  }
}
