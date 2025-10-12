import { NextResponse } from "next/server";
import {
  retrieveAllHistorialPagos,
  retrieveHistorialPagosByOrden,
  registrarPago,
} from "@/prisma/pagos";
import { FormaDePago } from "@/generated/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id_orden_pago = searchParams.get("id_orden_pago");

    if (id_orden_pago) {
      const historial = await retrieveHistorialPagosByOrden(
        parseInt(id_orden_pago)
      );
      return NextResponse.json(historial);
    }

    const historial = await retrieveAllHistorialPagos();
    return NextResponse.json(historial);
  } catch (error) {
    console.error("Error al obtener historial de pagos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id_orden_pago, monto, forma_pago, fecha, referencia } = body;

    if (!id_orden_pago || !monto || !forma_pago || !fecha) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    const result = await registrarPago({
      id_orden_pago: parseInt(id_orden_pago),
      monto: parseInt(monto),
      forma_pago: forma_pago as FormaDePago,
      fecha: new Date(fecha),
      referencia,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Obtener el historial actualizado
    const historial = await retrieveHistorialPagosByOrden(
      parseInt(id_orden_pago)
    );

    return NextResponse.json(historial, { status: 201 });
  } catch (error) {
    console.error("Error al registrar pago:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}