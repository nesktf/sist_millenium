"use server";

import { NextResponse } from "next/server";
import { prisma } from "@/prisma/instance";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const depositoId = searchParams.get("depositoId");
    const naturaleza = searchParams.get("naturaleza");

    const movimientos = await prisma.movimientoStock.findMany({
      where: {
        ...(depositoId ? { id_deposito: Number(depositoId) } : {}),
        ...(naturaleza
          ? {
              tipo_operacion: {
                naturaleza: naturaleza as "INGRESO" | "EGRESO",
              },
            }
          : {}),
      },
      select: {
        id: true,
        fecha_hora: true,
        num_comprobante: true,
        tipo_operacion: {
          select: {
            nombre: true,
            naturaleza: true,
          },
        },
        deposito: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: { fecha_hora: "desc" },
    });

    //Adaptamos cada variable
    const parsed = movimientos.map((mov) => ({
      id_mov_stock: mov.id,
      fecha: mov.fecha_hora,
      comprobante: mov.num_comprobante,
      tipoOperacion: mov.tipo_operacion?.nombre ?? "—",
      naturaleza: mov.tipo_operacion?.naturaleza ?? "—", // "EGRESO"
      deposito: mov.deposito?.nombre ?? "—",
    }));

    return NextResponse.json(parsed);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al obtener movimientos" },
      { status: 500 }
    );
  }
}
