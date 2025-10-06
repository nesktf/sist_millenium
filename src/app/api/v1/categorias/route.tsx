"use server";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/instance";

export async function GET() {
  const cats = await prisma.categoriaArticulo.findMany({
    orderBy: { nombre: "asc" },
  });
  return NextResponse.json(cats); // si querés solo {id,nombre}: cats.map(c=>({id:c.id,nombre:c.nombre}))
}

export async function POST(req: NextRequest) {
  try {
    const { nombre } = await req.json();
    const n = (nombre ?? "").toString().trim();
    if (!n) return NextResponse.json({ error: "Nombre es requerido" }, { status: 400 });

    const creada = await prisma.categoriaArticulo.create({ data: { nombre: n } });
    return NextResponse.json(creada, { status: 201 });
  } catch (e: any) {
    const msg = e?.code === "P2002" ? "Ya existe una categoría con ese nombre" : e?.message || "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


