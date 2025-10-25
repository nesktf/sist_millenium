// app/api/v1/tipo-comprobante-proveedor/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/prisma/instance";

export async function GET() {
  try {
    const tipos = await prisma.tipoComprobanteProveedor.findMany({
      orderBy: { nombre: 'asc' },
    });

    return NextResponse.json(tipos);
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
    const { nombre, descripcion } = body;

    if (!nombre) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    const nuevoTipo = await prisma.tipoComprobanteProveedor.create({
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || '',
      },
    });

    return NextResponse.json(nuevoTipo, { status: 201 });
  } catch (error) {
    console.error('Error al crear tipo de comprobante:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}