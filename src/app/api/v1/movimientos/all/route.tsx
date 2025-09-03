// app/api/v1/movimientos/all/route.tsx

import { NextResponse } from "next/server";
import  prisma  from "@/app/prisma";

export async function GET() {
  try {
    const movimientos = await prisma.movimientoStock.findMany({
      // No hay cláusula 'where', por lo que trae todos los movimientos
      include: {
        tipo_comprobante: true,
        dep_origen: true,
        dep_destino: true,
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

    // Transforma los datos para que el frontend los pueda usar fácilmente
    const resultado = movimientos.flatMap((mov) =>
      mov.detalles_mov.map((detalle) => ({
        id_mov_stock: mov.id,
        fecha: mov.fecha_hora,
        tipo: mov.tipo,
        comprobante: `${mov.tipo_comprobante?.nombre || ''} - ${mov.num_comprobante || ''}`,
        articulo: detalle.artic_depos.articulo.nombre,
        cantidad: detalle.cantidad,
        deposito: `${mov.dep_origen?.direccion || 'Externo'} → ${mov.dep_destino?.direccion || 'Externo'}`,
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