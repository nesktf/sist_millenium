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

    // Si se solicita filtrar por "sin orden", no agregamos el filtro aquí
    // porque ahora usamos la tabla intermedia ComprobanteOrdenPago

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
        ordenes_pago: {
          include: {
            orden_pago: {
              select: {
                id: true,
                numero: true,
                estado: true,
              },
            },
          },
        },
      },
      orderBy: {
        fecha: "desc",
      },
    });

    // Calcular información de pagos para cada comprobante
    const comprobantesConInfo = comprobantes.map(comp => {
      const totalPagado = comp.ordenes_pago.reduce(
        (sum, op) => sum + op.monto_pagado,
        0
      );
      const saldoPendiente = comp.total - totalPagado;
      const estadoPago = saldoPendiente === 0 
        ? 'PAGADO' 
        : totalPagado > 0 
          ? 'PARCIAL' 
          : 'PENDIENTE';

      // Determinar si tiene órdenes de pago
      const tieneOrdenPago = comp.ordenes_pago.length > 0 
        ? {
            id: comp.ordenes_pago[0].orden_pago.id,
            numero: comp.ordenes_pago[0].orden_pago.numero,
            estado: comp.ordenes_pago[0].orden_pago.estado,
          }
        : null;

      return {
        id: comp.id,
        fecha: comp.fecha,
        letra: comp.letra,
        sucursal: comp.sucursal,
        numero: comp.numero,
        total: comp.total,
        proveedor: comp.proveedor,
        tipo_comprobante: comp.tipo_comprobante,
        orden_pago: tieneOrdenPago, // Para compatibilidad con el frontend
        total_pagado: totalPagado,
        saldo_pendiente: saldoPendiente,
        estado_pago: estadoPago,
      };
    });

    // Aplicar filtro "sin_orden" después de calcular la info
    if (sin_orden === "true") {
      const sinOrden = comprobantesConInfo.filter(c => c.saldo_pendiente > 0);
      return NextResponse.json(sinOrden);
    }

    return NextResponse.json(comprobantesConInfo);
  } catch (error) {
    console.error("Error al obtener comprobantes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}