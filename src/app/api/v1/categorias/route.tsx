// app/api/v1/categorias/route.tsx
import { NextRequest, NextResponse } from "next/server";
import { registerCategoria, retrieveCategorias } from "@/prisma/categoria";

export async function GET() {
  let cats = await retrieveCategorias();
  return NextResponse.json(cats); // si querés solo {id,nombre}: cats.map(c=>({id:c.id,nombre:c.nombre}))
}

export async function POST(req: NextRequest) {
  const { nombre } = await req.json();
  const n = (nombre ?? "").toString().trim();
  if (!n || typeof(n) != "string") {
    return NextResponse.json({ error: "Nombre es requerido" }, { status: 400 });
  }

  let creada = await registerCategoria(n);
  if (creada.hasError()) {
    const error = creada.error();
    console.log(`ERROR: api/v1/categorias @ POST: ${error}`);
    return NextResponse.json({ error }, { status: 500 })
  }

  let cat = creada.unwrap();
  return NextResponse.json({id: cat.getId(), nombre: cat.getNombre()}, { status: 201 })
}
