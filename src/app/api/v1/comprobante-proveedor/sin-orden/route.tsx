import { NextResponse } from "next/server";
import {
  retrieveComprobantesSinOrden,
  retrieveComprobantesByProveedor,
} from "@/prisma/pagos";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id_proveedor = searchParams.get("id_proveedor");

    if (id_proveedor) {
      const comprobantes = await retrieveComprobantesByProveedor(
        parseInt(id_proveedor)
      );
      return NextResponse.json(comprobantes);
    }

    const comprobantes = await retrieveComprobantesSinOrden();
    return NextResponse.json(comprobantes);
  } catch (error) {
    console.error("Error al obtener comprobantes sin orden:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}