// app/api/v1/movimientos/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const movimientoId = parseInt(params.id);
    
    if (isNaN(movimientoId)) {
      return NextResponse.json(
        { error: "ID de movimiento inválido" },
        { status: 400 }
      );
    }

    // Obtener el movimiento específico con todos sus detalles
    const movimiento = await prisma.movimientoStock.findUnique({
      where: {
        id: movimientoId,
      },
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
    });

    if (!movimiento) {
      return NextResponse.json(
        { error: "Movimiento no encontrado" },
        { status: 404 }
      );
    }

    // Transformar los datos para la respuesta
    const resultado = {
      id: movimiento.id,
      fecha: movimiento.fecha_hora,
      tipo: movimiento.tipo,
      comprobante: `${movimiento.tipo_comprobante?.nombre || ''} - ${movimiento.num_comprobante || ''}`,
      deposito: {
        direccion: movimiento.deposito.direccion,
      },
      detalles_mov: movimiento.detalles_mov.map((detalle) => ({
        cantidad: detalle.cantidad,
        artic_depos: {
          articulo: {
            nombre: detalle.artic_depos.articulo.nombre,
          },
        },
      })),
    };

    return NextResponse.json(resultado);

  } catch (error) {
    console.error("Error al obtener detalle del movimiento:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}