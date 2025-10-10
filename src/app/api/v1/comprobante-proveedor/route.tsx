"use server";

import { NextResponse } from "next/server";
import { prisma } from "@/prisma/instance";

export async function GET() {
  try {
    const tipos = await prisma.tipoComprobanteProveedor.findMany({
      orderBy: { nombre: 'asc' },
    });

    return NextResponse.json(
      tipos.map((tipo) => ({
        id: tipo.id,
        nombre: tipo.nombre,
        descripcion: tipo.descripcion,
      }))
    );
  } catch (error) {
    console.error('Error al obtener tipos de comprobante:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id_proveedor, id_tipo_comprobante, sucursal, fecha, letra, numero, detalles } = body;

    if (!id_proveedor || !id_tipo_comprobante || !sucursal || !fecha || !letra || !numero || !Array.isArray(detalles) || detalles.length === 0) {
      return NextResponse.json({ error: "Faltan datos requeridos." }, { status: 400 });
    }

    const parsedProveedor = Number(id_proveedor);
    if (!Number.isInteger(parsedProveedor) || parsedProveedor <= 0) {
      return NextResponse.json({ error: "Proveedor inválido." }, { status: 400 });
    }

    const parsedTipoComprobante = Number(id_tipo_comprobante);
    if (!Number.isInteger(parsedTipoComprobante) || parsedTipoComprobante <= 0) {
      return NextResponse.json({ error: "Tipo de comprobante inválido." }, { status: 400 });
    }

    const sucursalTrimmed = String(sucursal).trim();
    if (!sucursalTrimmed) {
      return NextResponse.json({ error: "Sucursal inválida." }, { status: 400 });
    }

    const parsedDate = new Date(fecha);
    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: "Fecha inválida." }, { status: 400 });
    }

    const parsedDetalles = detalles.map((detalle: any, index: number) => {
      const { id_articulo, cantidad, precio_unitario, observacion } = detalle ?? {};

      const parsedArticulo = Number(id_articulo);
      if (!Number.isInteger(parsedArticulo) || parsedArticulo <= 0) {
        throw new Error(`Artículo inválido en el renglón ${index + 1}`);
      }

      const parsedCantidad = Number(cantidad);
      if (!Number.isFinite(parsedCantidad) || parsedCantidad <= 0) {
        throw new Error(`Cantidad inválida en el renglón ${index + 1}`);
      }

      const parsedPrecio = Number(precio_unitario);
      if (!Number.isFinite(parsedPrecio) || parsedPrecio <= 0) {
        throw new Error(`Precio inválido en el renglón ${index + 1}`);
      }

      return {
        id_articulo: parsedArticulo,
        cantidad: Math.round(parsedCantidad),
        precio_unitario: Math.round(parsedPrecio),
        observacion: typeof observacion === "string" && observacion.trim().length > 0 ? observacion.trim() : null,
      };
    });

    const total = parsedDetalles.reduce(
      (acc, detalle) => acc + detalle.cantidad * detalle.precio_unitario,
      0
    );

    const resultado = await prisma.$transaction(async (tx) => {
      const nuevoComprobante = await tx.comprobanteProveedor.create({
        data: {
          id_proveedor: parsedProveedor,
          id_tipo_comprobante: parsedTipoComprobante,
          fecha: parsedDate,
          letra,
          sucursal: sucursalTrimmed,
          numero,
        },
      });

      await tx.detalleComprobanteProveedor.createMany({
        data: parsedDetalles.map((detalle) => ({
          id_comprobante: nuevoComprobante.id,
          ...detalle,
        })),
      });

      return nuevoComprobante;
    });

    return NextResponse.json(
      {
        ...resultado,
        total,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error al crear comprobante:", error);
    const message = error instanceof Error ? error.message : 'Error interno del servidor';
    const status = error instanceof Error && /inválid/i.test(message)
      ? 400
      : 500;
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
