// app/api/v1/movimientos/all/route.tsx

import { NextResponse } from "next/server";
import  prisma  from "@/app/prisma";

export async function GET() {
  try {
    // Obtener todos los movimientos con sus detalles y artículos relacionados
    // CAMBIO: Incluir solo un depósito por movimiento
    const movimientos = await prisma.movimientoStock.findMany({
      include: {
        
        deposito: true,
        tipo_comprobante: true,
        detalles_mov: {
          include: {
            artic_depos: {
              include: {
                articulo: true,
              },
            },
          },
        },
      },
      orderBy: {
        fecha_hora: 'desc',
      },
    });

    // Transformar los datos para la respuesta
    const resultado = movimientos.flatMap((mov) =>
      mov.detalles_mov.map((detalle) => ({
        id_mov_stock: mov.id,
        fecha: mov.fecha_hora,
        tipo: mov.tipo,
        comprobante: `${mov.tipo_comprobante?.nombre || ''} - ${mov.num_comprobante || ''}`,
        articulo: detalle.artic_depos.articulo.nombre,
        cantidad: detalle.cantidad,
        // CAMBIO: Ahora solo hay un depósito por movimiento
        deposito: mov.deposito.direccion,
      }))
    );

    return NextResponse.json(resultado);

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al obtener todos los movimientos" },
      { status: 500 }
    );
  }
}