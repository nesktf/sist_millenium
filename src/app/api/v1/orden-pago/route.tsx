import { NextResponse } from "next/server";
import {
  retrieveOrdenPagoList,
  retrieveOrdenPago,
  registerOrdenPago,
  updateOrdenPagoEstado,
} from "@/prisma/pagos";
import { EstadoOrdenPago } from "@/generated/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const id_proveedor = searchParams.get("id_proveedor");
    const estado = searchParams.get("estado");

    // Si se proporciona un ID específico, devolver esa orden
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
      estado,
      total,
      id_comprobante,
      id_proveedor,
    } = body;

    if (!numero || !fecha || !id_comprobante || !id_proveedor || !total) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    const nuevaOrdenId = await registerOrdenPago({
      numero,
      fecha: new Date(fecha),
      estado: estado || EstadoOrdenPago.PENDIENTE,
      total: parseInt(total),
      saldo: parseInt(total),
      id_comprobante: parseInt(id_comprobante),
      id_proveedor: parseInt(id_proveedor),
    });

    const nuevaOrden = await retrieveOrdenPago(nuevaOrdenId);

    return NextResponse.json(nuevaOrden, { status: 201 });
  } catch (error) {
    console.error("Error al crear orden de pago:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, estado } = body;

    if (!id || !estado) {
      return NextResponse.json(
        { error: "Falta ID o estado" },
        { status: 400 }
      );
    }

    const success = await updateOrdenPagoEstado(
      parseInt(id),
      estado as EstadoOrdenPago
    );

    if (!success) {
      return NextResponse.json(
        { error: "Error al actualizar orden de pago" },
        { status: 500 }
      );
    }

    const ordenActualizada = await retrieveOrdenPago(parseInt(id));
    return NextResponse.json(ordenActualizada);
  } catch (error) {
    console.error("Error al actualizar orden de pago:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}