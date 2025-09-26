// app/api/v1/movimientos/all/route.tsx
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/app/prisma";

function buildDateRange(fecha: string, timezoneOffset?: number) {
  const [year, month, day] = String(fecha).split("-").map(Number);
  if (!year || !month || !day) {
    throw new Error("Fecha inválida");
  }

  const offsetMinutes =
    typeof timezoneOffset === "number" && !Number.isNaN(timezoneOffset)
      ? timezoneOffset
      : 0;
  const baseUtcMs = Date.UTC(year, month - 1, day, 0, 0, 0);
  const startDate = new Date(baseUtcMs + offsetMinutes * 60 * 1000);
  const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);

  return { startDate, endDate };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const tipo = searchParams.get('tipo');
    const articuloId = searchParams.get('articuloId');
    const fecha = searchParams.get('fecha');
    const timezoneOffsetParam = searchParams.get('timezoneOffset');
    const timezoneOffset = timezoneOffsetParam != null ? Number(timezoneOffsetParam) : undefined;

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
      try {
        const { startDate, endDate } = buildDateRange(fecha, timezoneOffset);
        whereClause.fecha_hora = {
          gte: startDate,
          lt: endDate,
        };
      } catch (err) {
        return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
      }
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
