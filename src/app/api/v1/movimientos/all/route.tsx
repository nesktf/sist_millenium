// app/api/v1/movimientos/all/route.tsx
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/app/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const tipo = searchParams.get('tipo');
    const articuloId = searchParams.get('articuloId');
    const fecha = searchParams.get('fecha');

    const whereClause: any = {};

    if (tipo && tipo !== "all") {
      whereClause.tipo = tipo;
    }
    if (articuloId && articuloId !== "all") {
      whereClause.detalles_mov = {
        some: {
          artic_depos: {
            id_articulo: parseInt(articuloId),
          },
        },
      };
    }
    if (fecha) {
      const startDate = new Date(fecha);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 1);
      whereClause.fecha_hora = {
        gte: startDate,
        lt: endDate,
      };
    }

    const movimientos = await prisma.movimientoStock.findMany({
      where: whereClause,
      include: {
        deposito: true,
        tipo_comprobante: true,
        detalles_mov: {
          include: { artic_depos: { include: { articulo: true } } },
        },
      },
      orderBy: { fecha_hora: 'desc' },
    });

    const resultado = movimientos.flatMap((mov) =>
      mov.detalles_mov.map((detalle) => ({
        id_mov_stock: mov.id,
        fecha: mov.fecha_hora,
        tipo: mov.tipo,
        comprobante: `${mov.tipo_comprobante?.nombre || ''} - ${mov.num_comprobante || ''}`,
        articulo: detalle.artic_depos.articulo.nombre,
        cantidad: detalle.cantidad,
        deposito: mov.deposito.direccion,
      }))
    );

    return NextResponse.json(resultado);

  } catch (error) {
    console.error("Error al obtener todos los movimientos:", error);
    return NextResponse.json({ error: "Error al obtener todos los movimientos" }, { status: 500 });
  }
}