import { NextResponse } from "next/server";
import { registerMovimiento, retrieveMovimientos } from "@/app/prisma";


export async function GET(req: Request) {
  let { id_deposito } = await req.json();
  if (typeof(id_deposito) != "number") {
    return NextResponse.json({ error: "Código de depósito inválido"}, { status: 400 });
  }
  let movs = await retrieveMovimientos(Number(id_deposito));
  if (movs.length == 0) {
    return NextResponse.json({ error: "No entries" }, { status: 400 });
  }
  return NextResponse.json({ movimientos: movs });
}

export async function POST(req: Request) {

}
