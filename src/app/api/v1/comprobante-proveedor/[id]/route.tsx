// app/api/v1/comprobante-proveedor/[id]/route.ts
import { NextResponse } from "next/server";
import { retrieveComprobanteWithPaymentInfo } from "@/prisma/pagos";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    const comprobante = await retrieveComprobanteWithPaymentInfo(id);

    if (!comprobante) {
      return NextResponse.json(
        { error: "Comprobante no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(comprobante);
  } catch (error) {
    console.error("Error al obtener comprobante:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}