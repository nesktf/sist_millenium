import { ItemOrdenCompra, OrdenCompraData, registerOrdenCompra, retrieveArticulo, retrieveOrdenCompra, retrieveOrdenesCompra, updateOrdenCompraSaldo } from "@/app/prisma";
import { FormaDePago } from "@/generated/prisma";
import { NextRequest, NextResponse } from "next/server"

export default async function GET(req: NextRequest) { 
  const orden_id = req.nextUrl.searchParams.get("orden_id");

  try {
    if (orden_id) {
      let data = await retrieveOrdenesCompra()
      .then((ordenes) => ordenes.map(async (orden) => {
        return {
          id: orden.id,
          forma_pago: orden.data.getFormaPago(),
          saldo: orden.data.getSaldo(),
          total: orden.data.getTotal(),
          items: orden.data.getItems().map(async (item) => {
            return {
              id: item.id,
              precio: item.precio,
              cantidad: item.cantidad,
              nombre: await retrieveArticulo(item.id).then((art) => art?.getNombre()),
            }
          }),
        }
      }));
      return NextResponse.json({ data })
    } else {
      let id = Number(orden_id);
      let data = await retrieveOrdenCompra(id)
      .then((orden) => {
        if (!orden) {
          throw Error(`Orden con id ${id} no encontrada`);
        }
        return {
          id: orden.id,
          forma_pago: orden.data.getFormaPago(),
          saldo: orden.data.getSaldo(),
          total: orden.data.getTotal(),
          items: orden.data.getItems().map(async (item) => {
            return {
              id: item.id,
              precio: item.precio,
              cantidad: item.cantidad,
              nombre: await retrieveArticulo(item.id).then((art) => art?.getNombre()),
            }
          })
        }
      })
      return NextResponse.json({ data })
    }
  } catch (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
}

export enum APIFormaPago {
  EFECTIVO = 0,
  TRANSFERENCIA = 1,
};

const forma_pago_map = new Map([
  [APIFormaPago.EFECTIVO, FormaDePago.EFECTIVO],
  [APIFormaPago.TRANSFERENCIA, FormaDePago.TRANSFERENCIA],
]);

export async function POST(req: NextRequest) {
  try {
    const { items: raw_items, forma_pago: raw_forma_pago } = await req.json();
    if (!raw_forma_pago) {
      throw new Error("Sin forma de pago");
    }
    let forma_pago = forma_pago_map.get(Number(raw_forma_pago));
    if (!forma_pago) {
      throw new Error("Forma de pago inválida");
    }

    if (!raw_items || !Array.isArray(raw_items)) {
      throw new Error("Sin items");
    }
    let items = raw_items.map((item, idx): ItemOrdenCompra => {
      const { id, precio, cantidad } = item;
      if (!id || !precio || !cantidad) {
        throw new Error(`Invalid item @ index ${idx}`);
      }
      return { id, precio, cantidad };
    });

    const orden_data = OrdenCompraData.fromItems(forma_pago, items)
    const out = await registerOrdenCompra(orden_data)
    .then((id_orden) => {
      if (!id_orden) {
        throw new Error("Failed to register OrdenCompra");
      }
      return {
        id: id_orden,
        forma_pago,
        saldo: orden_data.getTotal(),
        total: orden_data.getTotal(),
        items,
      }
    })
    return NextResponse.json({ data: out });
  } catch (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { orden_id: raw_orden_id, saldo: raw_saldo } = await req.json();
    if (!raw_orden_id) {
      throw new Error("Sin id de orden");
    }
    let orden_id = Number(raw_orden_id);

    if (!raw_saldo) {
      throw new Error("Sin saldo");
    }
    let saldo = Number(raw_saldo);

    if (!await updateOrdenCompraSaldo(orden_id, saldo)) {
      throw new Error("Failed to update orden");
    }

    return NextResponse.json({ data: { id: orden_id, saldo } });
  } catch (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
}
