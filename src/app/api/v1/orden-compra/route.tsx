"use server";

import { ItemOrdenCompra, OrdenCompraData, prisma, registerOrdenCompra, retrieveArticulo, retrieveOrdenCompra, retrieveOrdenesCompra, updateOrdenCompraSaldo } from "@/prisma/instance";
import { FormaDePago } from "@/generated/prisma";
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) { 
  const orden_id = req.nextUrl.searchParams.get("orden_id");

  try {
    if (orden_id == undefined) {
      let data = await retrieveOrdenesCompra()
      .then((ordenes) => Promise.all(ordenes.map(async (orden) => {
        return {
          id: orden.id,
          forma_pago: orden.data.getFormaPago(),
          saldo: orden.data.getSaldo(),
          total: orden.data.getTotal(),
          items: await Promise.all(orden.data.getItems().map(async (item) => {
            return {
              id: item.id,
              precio: item.precio,
              cantidad: item.cantidad,
              nombre: await retrieveArticulo(item.id).then((art) => art?.getNombre()),
            }
          })),
        }
      })));
      return NextResponse.json({ data })
    } else {
      let id = Number(orden_id);
      let data = await retrieveOrdenCompra(id)
      .then(async (orden) => {
        if (!orden) {
          throw Error(`Orden con id ${id} no encontrada`);
        }
        return {
          id: orden.id,
          forma_pago: orden.data.getFormaPago(),
          saldo: orden.data.getSaldo(),
          total: orden.data.getTotal(),
          items: await Promise.all(orden.data.getItems().map(async (item) => {
            return {
              id: item.id,
              precio: item.precio,
              cantidad: item.cantidad,
              nombre: await retrieveArticulo(item.id).then((art) => art?.getNombre()),
            }
          }))
        }
      })
      return NextResponse.json({ data })
    }
  } catch (error) {
    console.log(`Error @ GET: ${error}`);
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
    const {
      items: raw_items,
      forma_pago: raw_forma_pago,
      proveedor_id: raw_proveedor_id,
      fecha_entrega: raw_fecha_entrega,
      fecha_emision: raw_fecha_emision,
      deposito_id: raw_deposito_id,
    } = await req.json();
    if (raw_forma_pago == undefined) {
      throw new Error("Sin forma de pago");
    }
    let forma_pago = forma_pago_map.get(Number(raw_forma_pago));
    if (!forma_pago) {
      throw new Error("Forma de pago inválida");
    }

    if (raw_proveedor_id == undefined) {
      throw new Error("Sin proveedor");
    }
    const proveedorId = Number(raw_proveedor_id);
    if (!Number.isInteger(proveedorId) || proveedorId <= 0) {
      throw new Error("Proveedor inválido");
    }

    const parseDate = (value: unknown, label: string): Date | null => {
      if (!value) return null;
      const parsed = new Date(value as string);
      if (Number.isNaN(parsed.getTime())) {
        throw new Error(`Fecha ${label} inválida`);
      }
      return parsed;
    };

    const fechaEntrega = parseDate(raw_fecha_entrega, "de entrega");
    const fechaEmision = parseDate(raw_fecha_emision, "de emisión");
    const fechaEsperada = fechaEntrega ?? fechaEmision ?? new Date();

    let depositoId: number | null =
      raw_deposito_id == undefined ? null : Number(raw_deposito_id);
    if (depositoId != null) {
      if (!Number.isInteger(depositoId) || depositoId <= 0) {
        throw new Error("Depósito inválido");
      }
    } else {
      const defaultDeposito = await prisma.deposito.findFirst({
        select: { id: true },
        orderBy: { id: "asc" },
      });
      if (!defaultDeposito) {
        throw new Error("No hay depósitos disponibles");
      }
      depositoId = defaultDeposito.id;
    }

    if (raw_items == undefined || !Array.isArray(raw_items)) {
      throw new Error("Sin items");
    }
    let items = raw_items.map((item, idx): ItemOrdenCompra => {
      const { id, precio, cantidad } = item;
      if (!id || !precio || !cantidad) {
        throw new Error(`Invalid item @ index ${idx}`);
      }
      return { id, precio, cantidad };
    });

    if (depositoId == null) {
      throw new Error("Sin depósito");
    }

    const orden_data = OrdenCompraData.fromItems(forma_pago, items, {
      fecha_esperada: fechaEsperada,
      id_deposito: depositoId,
      id_proveedor: proveedorId,
    });
    const out = await registerOrdenCompra(orden_data)
    .then((id_orden) => {
      if (!id_orden) {
        throw new Error("Failed to register OrdenCompra");
      }
      return {
        id: id_orden,
        forma_pago,
        saldo: orden_data.getSaldo(),
        total: orden_data.getTotal(),
        items,
      }
    })
    return NextResponse.json({ data: out });
  } catch (error) {
    console.log(`Error @ POST ${error}`);
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
    console.log(`Error @ PUT ${error}`);
    return NextResponse.json({ error }, { status: 400 });
  }
}
