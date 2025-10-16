// app/api/v1/comprobante-proveedor/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/prisma/instance";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    const comprobante = await prisma.comprobanteProveedor.findUnique({
      where: { id },
      include: {
        proveedor: {
          select: {
            id: true,
            nombre: true,
            cuit: true,
          },
        },
        tipo_comprobante: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
          },
        },
        orden_pago: {
          select: {
            id: true,
            numero: true,
            fecha: true,
            estado: true,
            saldo: true,
            total: true,
          },
        },
        orden_compra: {
          select: {
            id: true,
            precio_total: true,
            forma_pago: true,
            fecha_esperada: true,
          },
        },
        detalles: {
          include: {
            articulo: {
              select: {
                id: true,
                codigo: true,
                nombre: true,
              },
            },
          },
        },
      },
    });

    if (!comprobante) {
      return NextResponse.json(
        { error: "Comprobante no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(comprobante);
  } catch (error) {
    console.error("Error al obtener comprobante:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}