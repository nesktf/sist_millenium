"use server";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/instance";

export async function GET(req: NextRequest) {
  const tipos = await prisma.tipoOperacion.findMany();
  return NextResponse.json(tipos);
}
