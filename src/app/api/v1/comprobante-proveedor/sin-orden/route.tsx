// /api/v1/comprobante-proveedor/sin-orden/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/prisma";

export async function GET() {
  try {
    // Obtener comprobantes que NO tienen orden de pago asociada
    const comprobantes = await prisma.comprobanteProveedor.findMany({
      where: {
        orden_pago: null // Solo comprobantes sin orden de pago
      },
      include: {
        proveedor: {
          select: {
            nombre: true
          }
        },
        tipo_comprobante: {
          select: {
            nombre: true
          }
        },
        detalles: {
          select: {
            cantidad: true,
            precio_unitario: true
          }
        }
      },
      orderBy: {
        fecha: 'desc'
      }
    });

    return NextResponse.json(comprobantes);
  } catch (error) {
    console.error("Error al obtener comprobantes sin orden:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}