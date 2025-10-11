"use server";

import {
  ItemOrdenCompra,
  OrdenCompraData,
  prisma,
  registerOrdenCompra,
  retrieveArticulo,
  updateOrdenCompraSaldo,
} from "@/prisma/instance";
import { FormaDePago } from "@/generated/prisma";
import { NextRequest, NextResponse } from "next/server";
import { APIFormaPago } from "../../v1/orden-compra/types/route"; // import enum compartido

export async function GET(req: NextRequest) {
  const proveedorNombre = req.nextUrl.searchParams.get("proveedor");
  const depositoNombre = req.nextUrl.searchParams.get("deposito");

  try {
    // Buscar órdenes con filtro opcional
    const ordenes = await prisma.ordenCompra.findMany({
      where: {
        AND: [
          proveedorNombre
            ? {
                proveedor: {
                  nombre: { contains: proveedorNombre, mode: "insensitive" },
                },
              }
            : {},
          depositoNombre
            ? {
                deposito: {
                  nombre: { contains: depositoNombre, mode: "insensitive" },
                },
              }
            : {},
        ],
      },
      include: {
        detalle: { include: { articulo: true } },
        proveedor: true,
        deposito: true,
      },
    });

    const data = ordenes.map((orden) => ({
      id: orden.id,
      forma_pago: orden.forma_pago,
      saldo: orden.saldo,
      total: orden.precio_total,
      fecha_esperada: orden.fecha_esperada,
      proveedor: orden.proveedor.nombre,
      deposito: orden.deposito.nombre,
      items: orden.detalle.map((item) => ({
        id: item.id,
        precio: item.precio,
        cantidad: item.cantidad,
        nombre: item.articulo?.nombre ?? "Sin nombre",
      })),
    }));

    return NextResponse.json({ data });
  } catch (error: unknown) {
    console.error("Error @ GET ordenes:", error);

    // Guardamos un mensaje seguro para el cliente
    let message = "Error desconocido";
    if (error instanceof Error) {
      message = error.message;
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

const forma_pago_map = new Map([
  [APIFormaPago.EFECTIVO, FormaDePago.EFECTIVO],
  [APIFormaPago.TRANSFERENCIA, FormaDePago.TRANSFERENCIA],
]);

export async function POST(req: NextRequest) {
  try {
    const {
      items: raw_items,
      forma_pago: raw_forma_pago,
      fecha_esperada,
      id_deposito,
      id_proveedor,
    } = await req.json();
    if (raw_forma_pago == undefined) {
      throw new Error("Sin forma de pago");
    }
    let forma_pago = forma_pago_map.get(Number(raw_forma_pago));
    if (!forma_pago) {
      throw new Error("Forma de pago inválida");
    }

    if (raw_items == undefined || !Array.isArray(raw_items)) {
      throw new Error("Sin items");
    }
    if (!fecha_esperada) throw new Error("Sin fecha esperada");
    if (!id_deposito) throw new Error("Sin depósito");
    if (!id_proveedor) throw new Error("Sin proveedor");
    let items = raw_items.map((item, idx): ItemOrdenCompra => {
      const { id, precio, cantidad } = item;
      if (!id || !precio || !cantidad) {
        throw new Error(`Invalid item @ index ${idx}`);
      }
      return { id, precio, cantidad };
    });

    const orden_data = OrdenCompraData.fromItems(
      forma_pago,
      items,
      new Date(fecha_esperada),
      Number(id_deposito),
      Number(id_proveedor)
    );
    const out = await registerOrdenCompra(orden_data).then((id_orden) => {
      if (!id_orden) {
        throw new Error("Failed to register OrdenCompra");
      }
      return {
        id: id_orden,
        forma_pago,
        saldo: orden_data.getTotal(),
        total: orden_data.getTotal(),
        fecha_esperada: orden_data.getFechaEsperada(),
        id_deposito: orden_data.getIdDeposito(),
        id_proveedor: orden_data.getIdProveedor(),
        items,
      };
    });
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

    if (!(await updateOrdenCompraSaldo(orden_id, saldo))) {
      throw new Error("Failed to update orden");
    }

    return NextResponse.json({ data: { id: orden_id, saldo } });
  } catch (error) {
    console.log(`Error @ PUT ${error}`);
    return NextResponse.json({ error }, { status: 400 });
  }
}
