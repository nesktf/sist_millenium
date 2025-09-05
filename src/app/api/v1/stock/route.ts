import { NextResponse } from "next/server";
import prisma from "../../../prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const codigo = (searchParams.get("codigo") ?? "").trim();
    if (!codigo) {
      return NextResponse.json({ error: "Falta 'codigo'." }, { status: 400 });
    }

    // 👇 nuevo: filtro opcional por depósito
    const depositoId = Number(searchParams.get("depositoId") ?? "");
    const whereDep = depositoId ? { deposito_id: depositoId } : {};

    const filas = await prisma.articDepos.findMany({
      where: {
        ...whereDep,
        Articulo:  { codigo: { contains: codigo, mode: "insensitive" } } ,
      },
      include: {
        Articulo: { include: { categoria: true, marca: true } },
        Deposito: true,
      },
      orderBy: { deposito_id: "asc" },
    });

    const data = filas.map((f) => ({
      codigo: f.Articulo.codigo,
      articulo: f.Articulo.nombre,
      categoria: f.Articulo.categoria?.nombre ?? "-",
      marca: f.Articulo.marca?.nombre ?? "-",
      deposito: f.Deposito.direccion,
      stock: f.stock,
      stock_min: f.stock_min,
      estado: f.stock >= f.stock_min ? "OK" : "REPONER",
    }));

    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Error interno" }, { status: 500 });
  }
}
