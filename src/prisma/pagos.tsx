import { prisma } from "./instance";
import { EstadoOrdenPago, FormaDePago } from "@/generated/prisma";

type DBId = number;

// ==================== ORDEN DE PAGO ====================

// Esta es la interfaz que usaba tu función anterior
export interface OrdenPagoData {
  numero: string;
  fecha: Date;
  estado: EstadoOrdenPago;
  saldo?: number;
  total: number;
  ids_comprobantes: number[];
  id_proveedor: number;
}


export async function registerOrdenPago(data: OrdenPagoData): Promise<DBId> {
  return await prisma.$transaction(async (tx) => {
    // 1. Crear la Orden de Pago
    const orden = await tx.ordenPago.create({
      data: {
        numero: data.numero,
        fecha: data.fecha,
        estado: data.estado,
        saldo: data.saldo ?? data.total,
        total: data.total,
        id_proveedor: data.id_proveedor,
      },
    });

    // 2. Vincular los comprobantes a la nueva orden
    await tx.comprobanteProveedor.updateMany({
      where: {
        id: { in: data.ids_comprobantes },
        id_proveedor: data.id_proveedor, 
        id_orden_pago: null,         
      },
      data: {
        id_orden_pago: orden.id,
      },
    });

    return orden.id;
  });
}

// --- NUEVA INTERFAZ PARA EL FLUJO UNIFICADO ---
export interface OrdenPagoConPagoData {
  // Datos Orden
  numero: string;
  fecha: Date;
  id_proveedor: number;
  ids_comprobantes: number[];
  total: number;
  
  // Datos Pago
  fecha_pago: Date;
  monto_pago: number;
  forma_pago: FormaDePago;
  referencia?: string;
}

// --- NUEVA FUNCIÓN PARA EL FLUJO UNIFICADO ---
export async function registerOrdenPagoConPagoInicial(data: OrdenPagoConPagoData): Promise<DBId> {
  
  // 1. Calcular nuevo saldo y estado
  const nuevoSaldo = data.total - data.monto_pago;
  
  const nuevoEstado = (nuevoSaldo <= 0) 
    ? EstadoOrdenPago.CANCELADO 
    : EstadoOrdenPago.PAGADO;

  // Validación de seguridad
  if (nuevoSaldo < 0) {
    throw new Error("El monto del pago no puede ser mayor al total.");
  }

  return await prisma.$transaction(async (tx) => {
    
    // 2. Crear la Orden de Pago
    const orden = await tx.ordenPago.create({
      data: {
        numero: data.numero,
        fecha: data.fecha,
        estado: nuevoEstado,
        saldo: nuevoSaldo,  
        total: data.total,
        id_proveedor: data.id_proveedor,
      },
    });

    // 3. Vincular los comprobantes a la nueva orden
    await tx.comprobanteProveedor.updateMany({
      where: {
        id: { in: data.ids_comprobantes },
        id_proveedor: data.id_proveedor,
        id_orden_pago: null,
      },
      data: {
        id_orden_pago: orden.id,
      },
    });

    // 4. Crear el primer registro en historial de pagos
    await tx.historialPago.create({
      data: {
        fecha: data.fecha_pago,
        id_orden_pago: orden.id,
        monto: data.monto_pago,
        forma_pago: data.forma_pago,
        referencia: data.referencia,
        saldo_anterior: data.total, 
        pendiente_por_pagar: nuevoSaldo, 
      },
    });

    // 5. Devolver el ID de la orden creada
    return orden.id;
  });
}


export async function retrieveOrdenPago(id: DBId) {
  return await prisma.ordenPago.findUnique({
    where: { id },
    include: {
      comprobantes: { 
        include: {
          proveedor: true,
          tipo_comprobante: true,
          detalles: {
            include: {
              articulo: true,
            },
          },
        },
      },
      proveedor: true,
      historial_pagos: {
        orderBy: {
          fecha: 'desc',
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
      estado: {
        not: EstadoOrdenPago.PENDIENTE
      }
    },
    include: {
      comprobantes: {
        include: {
          proveedor: true,
          tipo_comprobante: true,
        },
      },
      proveedor: true,
    },
    orderBy: {
      fecha: 'desc',
    },
  });
}

export async function updateOrdenPagoEstado(
  id: DBId,
  estado: EstadoOrdenPago
): Promise<boolean> {
  try {
    await prisma.ordenPago.update({
      where: { id },
      data: { estado },
    });
    return true;
  } catch (error) {
    console.error(`Error @ updateOrdenPagoEstado: ${error}`);
    return false;
  }
}

// ==================== HISTORIAL DE PAGOS ====================

export interface HistorialPagoData {
  fecha: Date;
  id_orden_pago: number;
  monto: number;
  forma_pago: FormaDePago;
  referencia?: string;
  saldo_anterior: number;
  pendiente_por_pagar: number;
}

export async function registerHistorialPago(
  data: HistorialPagoData
): Promise<DBId> {
  const historial = await prisma.historialPago.create({
    data: {
      fecha: data.fecha,
      id_orden_pago: data.id_orden_pago,
      monto: data.monto,
      forma_pago: data.forma_pago,
      referencia: data.referencia,
      saldo_anterior: data.saldo_anterior,
      pendiente_por_pagar: data.pendiente_por_pagar,
    },
  });
  return historial.id;
}

export async function retrieveHistorialPagosByOrden(id_orden_pago: DBId) {
  return await prisma.historialPago.findMany({
    where: { id_orden_pago },
    include: {
      orden_pago: {
        include: {
          comprobantes: {
            include: {
              proveedor: true,
            },
          },
          proveedor: true,
        },
      },
    },
    orderBy: {
      fecha: 'desc',
    },
  });
}

export async function retrieveAllHistorialPagos() {
  return await prisma.historialPago.findMany({
    include: {
      orden_pago: {
        include: {
          comprobantes: {
            include: {
              proveedor: true,
            },
          },
          proveedor: true,
        },
      },
    },
    orderBy: {
      fecha: 'desc',
    },
  });
}

// ==================== COMPROBANTES ====================

export async function retrieveComprobantesSinOrden() {
  return await prisma.comprobanteProveedor.findMany({
    where: {
      orden_pago: null,
    },
    include: {
      proveedor: true,
      tipo_comprobante: true,
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
}

export async function retrieveComprobantesByProveedor(id_proveedor: number) {
  return await prisma.comprobanteProveedor.findMany({
    where: {
      id_proveedor,
      orden_pago: null,
    },
    include: {
      tipo_comprobante: true,
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
}

// ==================== HELPER: REGISTRAR PAGO ====================

export async function registrarPago(params: {
  id_orden_pago: number;
  monto: number;
  forma_pago: FormaDePago;
  fecha: Date;
  referencia?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Obtener la orden de pago actual
      const orden = await tx.ordenPago.findUnique({
        where: { id: params.id_orden_pago },
      });

      if (!orden) {
        return { success: false, error: 'Orden de pago no encontrada' };
      }

      if (orden.estado === EstadoOrdenPago.CANCELADO) {
        return { success: false, error: 'Esta orden ya fue pagada completamente' };
      }

      const saldoAnterior = orden.saldo ?? orden.total;
      
      if (saldoAnterior <= 0) {
        return { success: false, error: 'Esta orden no tiene saldo pendiente' };
      }

      const pendientePorPagar = saldoAnterior - params.monto;

      if (pendientePorPagar < 0) {
        return {
          success: false,
          error: 'El monto a pagar excede el saldo pendiente',
        };
      }

      // 2. Crear el registro en historial de pagos
      await tx.historialPago.create({
        data: {
          fecha: params.fecha,
          id_orden_pago: params.id_orden_pago,
          monto: params.monto,
          forma_pago: params.forma_pago,
          referencia: params.referencia,
          saldo_anterior: saldoAnterior,
          pendiente_por_pagar: pendientePorPagar,
        },
      });

      // 3. Determinar el nuevo estado
      const nuevoEstado: EstadoOrdenPago = 
        pendientePorPagar === 0 
          ? EstadoOrdenPago.CANCELADO 
          : orden.estado === EstadoOrdenPago.PENDIENTE 
            ? EstadoOrdenPago.PAGADO 
            : orden.estado;

      // 4. Actualizar el saldo de la orden de pago
      await tx.ordenPago.update({
        where: { id: params.id_orden_pago },
        data: {
          saldo: pendientePorPagar,
          estado: nuevoEstado,
        },
      });

      return { success: true };
    });
  } catch (error) {
    console.error(`Error @ registrarPago: ${error}`);
    return { success: false, error: 'Error al procesar el pago' };
  }
}