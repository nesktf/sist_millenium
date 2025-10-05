import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/prisma";

export async function GET(req: NextRequest, context: any) {
  try {
    const params = await context.params;
    const movimientoId = parseInt(params.id);
    if (isNaN(movimientoId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const movimiento = await prisma.movimientoStock.findUnique({
      where: {
        id: movimientoId,
      },
      include: {
        deposito: true,
        tipo_comprobante: true,
        tipo_operacion: true,
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
      tipoOperacion: movimiento.tipo_operacion?.nombre || null,
      naturalezaOperacion: movimiento.tipo_operacion?.naturaleza || null,
      comprobante: `${movimiento.tipo_comprobante?.nombre || ""} - ${
        movimiento.num_comprobante || ""
      }`,
      deposito: {
        nombre: movimiento.deposito.nombre,
        direccion: movimiento.deposito.direccion,
      },
      detalles_mov: movimiento.detalles_mov.map((detalle) => ({
        cantidad: detalle.cantidad,
        articulo: {
          nombre: detalle.artic_depos.articulo.nombre,
          codigo: detalle.artic_depos.articulo.codigo,
        },
        stockActual: detalle.artic_depos.stock,
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
