import { prisma } from "./instance";
import { EstadoOrdenPago, FormaDePago, EstadoComprobanteEnOrden } from "@/generated/prisma";

type DBId = number;

// ==================== ORDEN DE PAGO ====================

export interface DetalleComprobanteOrden {
  id_comprobante: number;
  monto_pagado: number; // Cuánto se paga de este comprobante
}

export interface OrdenPagoData {
  numero: string;
  fecha: Date;
  id_proveedor: number;
  forma_pago: FormaDePago;
  referencia?: string;
  comprobantes: DetalleComprobanteOrden[]; // Array de comprobantes con sus montos
}

export async function registerOrdenPago(data: OrdenPagoData): Promise<DBId> {
  return await prisma.$transaction(async (tx) => {
    // 1. Obtener los comprobantes con sus totales actuales y saldos
    const comprobantesData = await tx.comprobanteProveedor.findMany({
      where: {
        id: { in: data.comprobantes.map(c => c.id_comprobante) },
        id_proveedor: data.id_proveedor,
      },
      include: {
        ordenes_pago: true, // Para calcular cuánto ya se pagó
      },
    });

    if (comprobantesData.length !== data.comprobantes.length) {
      throw new Error("Algunos comprobantes no existen o no pertenecen al proveedor");
    }

    // 2. Calcular total de la orden y validar montos
    let totalOrden = 0;
    const detallesParaCrear: Array<{
      id_comprobante: number;
      total_comprobante: number;
      monto_pagado: number;
      saldo_pendiente: number;
      estado: EstadoComprobanteEnOrden;
    }> = [];

    for (const detalleOrden of data.comprobantes) {
      const comprobante = comprobantesData.find(c => c.id === detalleOrden.id_comprobante);
      if (!comprobante) continue;

      // Calcular cuánto ya se pagó de este comprobante en órdenes anteriores
      const totalPagadoAntes = comprobante.ordenes_pago.reduce(
        (sum, op) => sum + op.monto_pagado,
        0
      );
      const saldoActual = comprobante.total - totalPagadoAntes;

      // Validar que no se pague más de lo que debe
      if (detalleOrden.monto_pagado > saldoActual) {
        throw new Error(
          `El monto a pagar del comprobante ${comprobante.letra}-${comprobante.sucursal}-${comprobante.numero} ` +
          `excede el saldo pendiente (${saldoActual})`
        );
      }

      if (detalleOrden.monto_pagado <= 0) {
        throw new Error("El monto a pagar debe ser mayor a cero");
      }

      totalOrden += detalleOrden.monto_pagado;

      const nuevoSaldo = saldoActual - detalleOrden.monto_pagado;
      const estado = nuevoSaldo === 0 
        ? EstadoComprobanteEnOrden.PAGADO 
        : totalPagadoAntes > 0 || detalleOrden.monto_pagado < comprobante.total
          ? EstadoComprobanteEnOrden.PARCIAL
          : EstadoComprobanteEnOrden.PENDIENTE;

      detallesParaCrear.push({
        id_comprobante: comprobante.id,
        total_comprobante: comprobante.total,
        monto_pagado: detalleOrden.monto_pagado,
        saldo_pendiente: nuevoSaldo,
        estado,
      });
    }

    // 3. Crear la Orden de Pago
    const orden = await tx.ordenPago.create({
      data: {
        numero: data.numero,
        fecha: data.fecha,
        estado: EstadoOrdenPago.PAGADO, // Siempre PAGADO porque ya se pagó
        saldo: 0, // Siempre 0 porque no hay pagos pendientes
        total: totalOrden,
        id_proveedor: data.id_proveedor,
        forma_pago: data.forma_pago,
        referencia: data.referencia,
      },
    });

    // 4. Crear los registros en la tabla intermedia
    await tx.comprobanteOrdenPago.createMany({
      data: detallesParaCrear.map(detalle => ({
        id_orden_pago: orden.id,
        ...detalle,
      })),
    });

    return orden.id;
  });
}

export async function retrieveOrdenPago(id: DBId) {
  return await prisma.ordenPago.findUnique({
    where: { id },
    include: {
      proveedor: true,
      comprobantes: {
        include: {
          comprobante: {
            include: {
              tipo_comprobante: true,
              proveedor: true,
              detalles: {
                include: {
                  articulo: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function retrieveOrdenPagoList(filters?: {
  id_proveedor?: number;
  estado?: EstadoOrdenPago;
}) {
  return await prisma.ordenPago.findMany({
    where: {
      ...(filters?.id_proveedor && { id_proveedor: filters.id_proveedor }),
      ...(filters?.estado && { estado: filters.estado }),
    },
    include: {
      proveedor: true,
      comprobantes: {
        include: {
          comprobante: {
            include: {
              tipo_comprobante: true,
              proveedor: true,
            },
          },
        },
      },
    },
    orderBy: {
      fecha: 'desc',
    },
  });
}

// ==================== COMPROBANTES ====================

export async function retrieveComprobantesSinPagar() {
  const comprobantes = await prisma.comprobanteProveedor.findMany({
    include: {
      proveedor: true,
      tipo_comprobante: true,
      ordenes_pago: true,
      detalles: {
        include: {
          articulo: true,
        },
      },
    },
    orderBy: {
      fecha: 'desc',
    },
  });

  // Filtrar solo los que tienen saldo pendiente
  return comprobantes
    .map(comp => {
      const totalPagado = comp.ordenes_pago.reduce(
        (sum, op) => sum + op.monto_pagado,
        0
      );
      const saldoPendiente = comp.total - totalPagado;
      
      return {
        ...comp,
        total_pagado: totalPagado,
        saldo_pendiente: saldoPendiente,
      };
    })
    .filter(comp => comp.saldo_pendiente > 0);
}

export async function retrieveComprobantesByProveedor(id_proveedor: number) {
  const comprobantes = await prisma.comprobanteProveedor.findMany({
    where: {
      id_proveedor,
    },
    include: {
      tipo_comprobante: true,
      ordenes_pago: true,
      detalles: {
        include: {
          articulo: true,
        },
      },
    },
    orderBy: {
      fecha: 'desc',
    },
  });

  // Agregar información de pagos
  return comprobantes.map(comp => {
    const totalPagado = comp.ordenes_pago.reduce(
      (sum, op) => sum + op.monto_pagado,
      0
    );
    const saldoPendiente = comp.total - totalPagado;
    
    return {
      ...comp,
      total_pagado: totalPagado,
      saldo_pendiente: saldoPendiente,
    };
  });
}

export async function retrieveComprobanteWithPaymentInfo(id: number) {
  const comprobante = await prisma.comprobanteProveedor.findUnique({
    where: { id },
    include: {
      proveedor: true,
      tipo_comprobante: true,
      orden_compra: true,
      ordenes_pago: {
        include: {
          orden_pago: {
            include: {
              proveedor: true,
            },
          },
        },
        orderBy: {
          orden_pago: {
            fecha: 'desc',
          },
        },
      },
      detalles: {
        include: {
          articulo: true,
        },
      },
    },
  });

  if (!comprobante) return null;

  // Calcular información de pagos
  const totalPagado = comprobante.ordenes_pago.reduce(
    (sum, op) => sum + op.monto_pagado,
    0
  );
  const saldoPendiente = comprobante.total - totalPagado;
  const estadoPago = saldoPendiente === 0 
    ? 'PAGADO' 
    : totalPagado > 0 
      ? 'PARCIAL' 
      : 'PENDIENTE';

  return {
    ...comprobante,
    total_pagado: totalPagado,
    saldo_pendiente: saldoPendiente,
    estado_pago: estadoPago,
  };
}