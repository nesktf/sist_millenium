import { NextResponse } from "next/server";
import {
  // --- CORREGIDO ---
  retrieveComprobantesSinPagar, // Se cambió "retrieveComprobantesSinOrden" por "retrieveComprobantesSinPagar"
  // --- FIN CORRECCIÓN ---
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
      // Filtrar solo los que tienen saldo pendiente
      const sinPagar = comprobantes.filter((c) => c.saldo_pendiente > 0);
      return NextResponse.json(sinPagar);
    }

    // --- CORREGIDO ---
    const comprobantes = await retrieveComprobantesSinPagar(); // Se llamó a la función correcta
    // --- FIN CORRECCIÓN ---
    
    return NextResponse.json(comprobantes);
  } catch (error) {
    console.error("Error al obtener comprobantes sin orden:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
