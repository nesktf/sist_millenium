// app/api/v1/movimientos/route.tsx

import { NextResponse } from "next/server";
import { prisma } from "@/app/prisma";

export async function GET() {
  try {
    // 1. Hacemos la consulta usando el nombre correcto: 'movimientoStock'
    const movimientos = await prisma.movimientoStock.findMany({
      include: {
        tipo_comprobante: true,    // Para el nombre del comprobante
        dep_origen: true,          // Para el nombre del depósito origen
        dep_destino: true,         // Para el nombre del depósito destino
        detalles_mov: {            // Anidamos para llegar hasta el nombre del artículo
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
        fecha_hora: 'desc', // Ordenamos por el campo 'fecha_hora'
      },
    });

    // 2. Transformamos los datos para que coincidan con la tabla del frontend
    const resultado = movimientos.flatMap((mov) =>
      mov.detalles_mov.map((detalle) => ({
        id_mov_stock: mov.id, // Corregido a 'id'
        fecha_mov: mov.fecha_hora.toISOString(), // Usamos el campo 'fecha_hora'
        hora_mov: mov.fecha_hora.toLocaleTimeString('es-AR'), // Extraemos la hora
        producto_nombre: detalle.artic_depos.articulo.nombre,
        tipo_mov: mov.tipo, // El 'tipo' ya es un string (INGRESO, EGRESO, etc.)
        cantidad: detalle.cantidad,
        deposito_origen: mov.dep_origen?.direccion || 'N/A', // Usamos ?. para seguridad
        deposito_destino: mov.dep_destino?.direccion || 'N/A',
        tipo_comprobante: mov.tipo_comprobante?.nombre || 'N/A',
        nro_comprobante: mov.num_comprobante || 'N/A',
      }))
    );

    // 3. Devolvemos el resultado en formato JSON
    return NextResponse.json(resultado);

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al obtener los movimientos" },
      { status: 500 }
    );
  }
}