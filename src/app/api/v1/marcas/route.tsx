// app/api/v1/marcas/route.tsx
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/prisma";

export async function GET() {
  const marcas = await prisma.marcaArticulo.findMany({
    orderBy: { nombre: "asc" },
  });
  return NextResponse.json(marcas); // o marcas.map(m=>({id:m.id,nombre:m.nombre}))
}

export async function POST(req: NextRequest) {
  try {
    const { nombre } = await req.json();
    const n = (nombre ?? "").toString().trim();
    if (!n) return NextResponse.json({ error: "Nombre es requerido" }, { status: 400 });

    const creada = await prisma.marcaArticulo.create({ data: { nombre: n } });
    return NextResponse.json(creada, { status: 201 });
  } catch (e: any) {
    const msg = e?.code === "P2002" ? "Ya existe una marca con ese nombre" : e?.message || "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

