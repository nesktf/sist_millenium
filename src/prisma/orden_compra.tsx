import { FormaDePago } from "@/generated/prisma";
import { prisma, DBId, DBData } from "@/prisma/instance";

export type ItemOrdenCompra = {
  id: DBId;
  precio: number;
  cantidad: number;
}

export class OrdenCompraData {
  forma_pago: FormaDePago;
  saldo: number;
  total: number;
  items: Array<ItemOrdenCompra>;

  private constructor(forma_pago: FormaDePago, saldo: number, total: number,
                      items: Array<ItemOrdenCompra>)
  {
    this.forma_pago = forma_pago;
    this.saldo = saldo;
    this.total = total;
    this.items = items;
  }

  getFormaPago(): FormaDePago { return this.forma_pago; }
  getTotal(): number { return this.total; }
  getSaldo(): number { return this.saldo; }
  getItems(): Array<ItemOrdenCompra> { return this.items; }

  static fromItems(forma_pago: FormaDePago, items: Array<ItemOrdenCompra>): OrdenCompraData {
    let total = items.reduce((total, curr) => total + curr.precio*curr.cantidad, 0);
    return new OrdenCompraData(forma_pago, total, total, items);
  }
  static fromDBEntry({
    forma_pago, saldo, total, items
  }: { forma_pago: FormaDePago, saldo: number, total: number, items: Array<ItemOrdenCompra>}) {
    return new OrdenCompraData(forma_pago, saldo, total, items);
  }
};

export async function registerOrdenCompra(orden: OrdenCompraData): Promise<DBId|null> {
  try {
    const trans_res = await prisma.$transaction(async (tx) => {
      const orden_entry = await tx.ordenCompra.create({
        data: {
          precio_total: orden.getTotal(),
          forma_pago: orden.getFormaPago(),
          saldo: orden.getTotal(),
        } });
      await tx.detalleOrdenCompra.createMany({
        data: orden.getItems().map((item) => {
          return {
            id_orden: orden_entry.id,
            id_articulo: item.id,
            precio: item.precio,
            cantidad: item.cantidad,
          }
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


export async function retrieveOrdenesCompra(): Promise<Array<DBData<OrdenCompraData>>> {
  try {
    return await prisma.ordenCompra.findMany({ include: { detalle: true }})
    .then((ordenes) => ordenes.map((orden) => {
      return {
        id: orden.id,
        data: OrdenCompraData.fromDBEntry({
          forma_pago: orden.forma_pago,
          saldo: orden.saldo,
          total: orden.precio_total,
          items: orden.detalle.map((item) => {
            return { id: item.id, precio: item.precio, cantidad: item.cantidad, }
          }),
        })
      };
    }))
  } catch (err) {
    console.log(`Error @ retrieveOrdenesCompra: ${err}`);
    return []
  }
}

export async function retrieveOrdenCompra(id: DBId): Promise<DBData<OrdenCompraData>|null> {
  try {
    return await prisma.ordenCompra.findUniqueOrThrow({
      where: { id },
      include: {
        detalle: true
      }
    })
    .then((orden) => {
      return {
        id: orden.id,
        data: OrdenCompraData.fromDBEntry({
          forma_pago: orden.forma_pago,
          saldo: orden.saldo,
          total: orden.precio_total,
          items: orden.detalle.map((item) => {
            return { id: item.id, precio: item.precio, cantidad: item.cantidad }
          }),
        }),
      }
    });
  } catch (err) {
    console.log(`Error @ retrieveOrdenCompra: ${err}`);
    return null;
  }
}

export async function updateOrdenCompraSaldo(id: DBId, saldo: number): Promise<boolean> {
  try {
    await prisma.ordenCompra.update({
      where: { id },
      data: { saldo }
    });
    return true;
  } catch (err) {
    console.log(`Error @ updateOrdenCompraSaldo: ${err}`);
    return false;
  }
}
