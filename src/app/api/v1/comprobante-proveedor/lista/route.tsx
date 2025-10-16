// app/api/v1/comprobante-proveedor/lista/route.ts
"use server";

import { NextResponse } from "next/server";
import { prisma } from "@/prisma/instance";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id_proveedor = searchParams.get("id_proveedor");
    const id_tipo = searchParams.get("id_tipo");
    const sin_orden = searchParams.get("sin_orden");

    // Construir filtros dinámicamente
    const where: any = {};

    if (id_proveedor) {
      where.id_proveedor = parseInt(id_proveedor);
    }

    if (id_tipo) {
      where.id_tipo_comprobante = parseInt(id_tipo);
    }

    if (sin_orden === "true") {
      where.orden_pago = null;
    }

    const comprobantes = await prisma.comprobanteProveedor.findMany({
      where,
      include: {
        proveedor: {
          select: {
            id: true,
            nombre: true,
          },
        },
        tipo_comprobante: {
          select: {
            id: true,
            nombre: true,
          },
        },
        orden_pago: {
          select: {
            id: true,
            numero: true,
            estado: true,
          },
        },
      },
      orderBy: {
        fecha: "desc",
      },
    });

    return NextResponse.json(comprobantes);
  } catch (error) {
    console.error("Error al obtener comprobantes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}