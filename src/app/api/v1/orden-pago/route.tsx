import { NextResponse } from "next/server";
import {
  retrieveOrdenPagoList,
  retrieveOrdenPago,
  registerOrdenPago,
} from "@/prisma/pagos";
import { EstadoOrdenPago, FormaDePago } from "@/generated/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const id_proveedor = searchParams.get("id_proveedor");
    const estado = searchParams.get("estado");

    if (id) {
      const orden = await retrieveOrdenPago(parseInt(id));
      if (!orden) {
        return NextResponse.json(
          { error: "Orden de pago no encontrada" },
          { status: 404 }
        );
      }
      return NextResponse.json(orden);
    }

    // Construir filtros
    const filters: any = {};
    if (id_proveedor) {
      filters.id_proveedor = parseInt(id_proveedor);
    }
    if (estado && Object.values(EstadoOrdenPago).includes(estado as any)) {
      filters.estado = estado as EstadoOrdenPago;
    }

    const ordenes = await retrieveOrdenPagoList(filters);
    return NextResponse.json(ordenes);
  } catch (error) {
    console.error("Error al obtener órdenes de pago:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      numero,
      fecha,
      id_proveedor,
      forma_pago,
      referencia,
      comprobantes, // Array de { id_comprobante, monto_pagado }
    } = body;

    // Validación
    if (
      !numero ||
      !fecha ||
      !id_proveedor ||
      !forma_pago ||
      !comprobantes ||
      !Array.isArray(comprobantes) ||
      comprobantes.length === 0
    ) {
      return NextResponse.json(
        { error: "Faltan datos requeridos para la orden de pago" },
        { status: 400 }
      );
    }

    // Validar que todos los comprobantes tengan monto
    for (const comp of comprobantes) {
      if (!comp.id_comprobante || comp.monto_pagado == null || comp.monto_pagado <= 0) {
        return NextResponse.json(
          { error: "Todos los comprobantes deben tener un monto válido" },
          { status: 400 }
        );
      }
    }

    // Crear la orden
    const nuevaOrdenId = await registerOrdenPago({
      numero,
      fecha: new Date(fecha),
      id_proveedor: parseInt(id_proveedor),
      forma_pago: forma_pago as FormaDePago,
      referencia: referencia || undefined,
      comprobantes: comprobantes.map((c: any) => ({
        id_comprobante: parseInt(c.id_comprobante),
        monto_pagado: parseFloat(c.monto_pagado),
      })),
    });

    const nuevaOrden = await retrieveOrdenPago(nuevaOrdenId);
    return NextResponse.json(nuevaOrden, { status: 201 });
  } catch (error: any) {
    console.error("Error al crear orden de pago:", error);

    if (error.message.includes("excede el saldo")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}