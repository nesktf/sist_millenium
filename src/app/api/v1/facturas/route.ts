import { NextResponse } from "next/server";
import { prisma } from "@/prisma/instance";

export async function GET() {
  try {
    const facturas = await prisma.facturaVenta.findMany({
      orderBy: { fecha_emision: "desc" },
      select: {
        id: true,
        numero: true,
        total: true,
        estado: true,
        venta: {
          select: {
            id: true,
            // podés agregar más info de la venta si querés
          },
        },
      },
    });
    return NextResponse.json(facturas); // <- devuelve solo array
  } catch (error) {
    console.error("[facturas][GET]", error);
    return NextResponse.json(
      { error: "No se pudieron obtener las facturas." },
      { status: 500 }
    );
  }
}
