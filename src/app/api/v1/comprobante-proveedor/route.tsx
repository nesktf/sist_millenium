"use server";

import { NextResponse } from "next/server";
import { prisma } from "@/prisma/instance";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id_proveedor, fecha, letra, numero, detalles } = body;

    if (!id_proveedor || !fecha || !letra || !numero || !detalles || detalles.length === 0) {
      return NextResponse.json({ error: "Faltan datos requeridos." }, { status: 400 });
    }

    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Creamos el comprobante principal
      const nuevoComprobante = await tx.comprobanteProveedor.create({
        data: {
          id_proveedor: parseInt(id_proveedor),
          id_tipo_comprobante: 1, // Asumimos '1' como un tipo por defecto
          fecha: new Date(fecha),
          letra,
          sucursal: "0001", // Dato de ejemplo
          numero,
        },
      });

      // 2. Preparamos los detalles para guardarlos
      const detallesParaCrear = detalles.map((detalle: any) => ({
        id_comprobante: nuevoComprobante.id,
        id_articulo: detalle.id_articulo,
        cantidad: detalle.cantidad,
        precio_unitario: detalle.precio_unitario,
        observacion: detalle.observacion,
      }));

      // 3. Creamos todos los detalles de una sola vez
      await tx.detalleComprobanteProveedor.createMany({
        data: detallesParaCrear,
      });

      return nuevoComprobante;
    });

    return NextResponse.json(resultado, { status: 201 }); 

  } catch (error) {
    console.error("Error al crear comprobante:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
