import { prisma } from "@/prisma/instance";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const facturaId = Number(params.id);
  if (isNaN(facturaId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const factura = await prisma.facturaVenta.findUnique({
      where: { id: facturaId },
      include: {
        venta: {
          include: {
            detalle: {
              include: {
                articulo: true, // trae toda la info del artículo
              },
            },
          },
        },
      },
    });

    if (!factura) {
      return NextResponse.json(
        { error: "Factura no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        id: factura.id,
        numero: factura.numero,
        estado: factura.estado,
        total: factura.total, // asegurate que exista este campo
        detalle: factura.venta.detalle.map((d) => ({
          id: d.id,
          nombreArticulo: d.articulo.nombre, // <- aquí tomamos el nombre del artículo
          cantidad: d.cantidad,
          precio: d.precio,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[factura][GET]", error);
    return NextResponse.json(
      { error: "Error al obtener la factura" },
      { status: 500 }
    );
  }
}
