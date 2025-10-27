import { NextResponse } from "next/server";
import {
  retrieveComprobantesSinPagar,
  retrieveComprobantesByProveedor,
} from "@/prisma/pagos";
import { prisma } from "@/prisma/instance"; // Importamos prisma

// --- TU FUNCIÓN GET EXISTENTE ---
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id_proveedor = searchParams.get("id_proveedor");

    if (id_proveedor) {
      const comprobantes = await retrieveComprobantesByProveedor(
        parseInt(id_proveedor)
      );
      // Filtrar solo los que tienen saldo pendiente
      const sinPagar = comprobantes.filter((c) => c.saldo_pendiente > 0);
      return NextResponse.json(sinPagar);
    }

    const comprobantes = await retrieveComprobantesSinPagar();
    return NextResponse.json(comprobantes);
  } catch (error) {
    console.error("Error al obtener comprobantes sin pagar:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// --- NUEVA FUNCIÓN POST ---
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      numero,
      fecha,
      letra,
      sucursal,
      id_proveedor,
      id_tipo_comprobante,
      detalles, // Array: { id_articulo, cantidad, precio_unitario, observacion }
    } = body;

    // 1. Validación básica de datos
    if (
      !fecha ||
      !letra ||
      !sucursal ||
      !id_proveedor ||
      !id_tipo_comprobante ||
      !detalles ||
      detalles.length === 0
    ) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    // 2. Calcular el total en el backend (más seguro)
    let totalCalculado = 0;
    for (const detalle of detalles) {
      if (
        !detalle.id_articulo ||
        !detalle.cantidad ||
        detalle.precio_unitario == null || // puede ser 0
        detalle.cantidad <= 0
      ) {
        return NextResponse.json(
          { error: "Detalles del comprobante inválidos" },
          { status: 400 }
        );
      }
      totalCalculado += detalle.cantidad * detalle.precio_unitario;
    }

    // 3. Crear el comprobante y sus detalles en una transacción
    const nuevoComprobante = await prisma.comprobanteProveedor.create({
      data: {
        numero: numero || "", // Asumimos que puede ser opcional
        fecha: new Date(fecha),
        letra,
        sucursal,
        total: totalCalculado,
        id_proveedor: parseInt(id_proveedor),
        id_tipo_comprobante: parseInt(id_tipo_comprobante),
        // Crear los detalles relacionados
        detalles: {
          createMany: {
            data: detalles.map((d: any) => ({
              id_articulo: parseInt(d.id_articulo),
              cantidad: d.cantidad,
              precio_unitario: d.precio_unitario,
              observacion: d.observacion || null,
            })),
          },
        },
      },
      include: {
        detalles: true, // Devolver los detalles creados
      },
    });

    // 4. Devolver respuesta exitosa
    return NextResponse.json(nuevoComprobante, { status: 201 });
    
  } catch (error) {
    console.error("Error al crear comprobante:", error);
    // Manejo de errores (ej. si el id_proveedor no existe)
    if (error instanceof Error) {
      // @ts-ignore
      if (error.code === 'P2003') { // Error de Foreign Key (ej. proveedor no existe)
         return NextResponse.json({ error: "El proveedor o tipo de comprobante no existe" }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
