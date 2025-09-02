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
        articulo: { is: { codigo: { contains: codigo, mode: "insensitive" } } },
      },
      include: {
        articulo: { include: { categoria: true, marca: true } },
        deposito: true,
      },
      orderBy: { id_deposito: "asc" },
    });

    const data = filas.map((f) => ({
      codigo: f.articulo.codigo,
      articulo: f.articulo.nombre,
      categoria: f.articulo.categoria?.nombre ?? "-",
      marca: f.articulo.marca?.nombre ?? "-",
      deposito: f.deposito.direccion,
      stock: f.stock,
      stock_min: f.stock_min,
      estado: f.stock >= f.stock_min ? "OK" : "REPONER",
    }));

    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Error interno" }, { status: 500 });
  }
}
