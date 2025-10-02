// app/api/v1/tipo_operacion/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../prisma";

export async function GET(req: NextRequest) {
  const tipos = await prisma.tipoOperacion.findMany();
  return NextResponse.json(tipos);
}
