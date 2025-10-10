"use server";

import { NextResponse } from "next/server";
import { prisma } from "@/prisma/instance";

export async function GET() {
  try {
    const ordenes = await prisma.ordenPago.findMany({
      include: {
        comprobante: {
          include: {
            proveedor: {
              select: {
                nombre: true
              }
            },
            tipo_comprobante: {
              select: {
                nombre: true
              }
            }
          }
        }
      },
      orderBy: {
        fecha: 'desc'
      }
    });

    return NextResponse.json(ordenes);
  } catch (error) {
    console.error("Error al obtener órdenes de pago:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id_comprobante, fecha, estado, cantidad } = body;

    if (!id_comprobante || !fecha) {
      return NextResponse.json(
        { error: "Faltan datos requeridos (id_comprobante, fecha)" },
        { status: 400 }
      );
    }

    // Verificar que el comprobante existe y no tiene ya una orden de pago
    const comprobanteExistente = await prisma.comprobanteProveedor.findUnique({
      where: { id: parseInt(id_comprobante) },
      include: { orden_pago: true }
    });

    if (!comprobanteExistente) {
      return NextResponse.json(
        { error: "El comprobante especificado no existe" },
        { status: 404 }
      );
    }

    if (comprobanteExistente.orden_pago) {
      return NextResponse.json(
        { error: "Este comprobante ya tiene una orden de pago asociada" },
        { status: 400 }
      );
    }

    const nuevaOrden = await prisma.ordenPago.create({
      data: {
        id_comprobante: parseInt(id_comprobante),
        fecha: new Date(fecha),
        estado: estado || 'PENDIENTE',
        cantidad: cantidad ? parseInt(cantidad) : null,
      },
      include: {
        comprobante: {
          include: {
            proveedor: {
              select: {
                nombre: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(nuevaOrden, { status: 201 });
  } catch (error) {
    console.error("Error al crear orden de pago:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, estado, cantidad } = body;

    if (!id) {
      return NextResponse.json({ error: "Falta ID" }, { status: 400 });
    }

    const ordenActualizada = await prisma.ordenPago.update({
      where: { id: parseInt(id) },
      data: {
        ...(estado && { estado }),
        ...(cantidad !== undefined && { cantidad: cantidad ? parseInt(cantidad) : null })
      },
      include: {
        comprobante: {
          include: {
            proveedor: {
              select: {
                nombre: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(ordenActualizada);
  } catch (error) {
    console.error("Error al actualizar orden de pago:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
