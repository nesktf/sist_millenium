"use server"

import { NextResponse } from "next/server"
import type { Prisma } from "@/generated/prisma"
import { prisma } from "@/prisma/instance"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)

    // filtros
    const rawQuery =
      (searchParams.get("query") ??
        searchParams.get("search") ??
        searchParams.get("codigo") ??
        ""
      ).trim()

    const depositoIdParam = searchParams.get("depositoId")
    const depositoId =
      depositoIdParam && depositoIdParam.length > 0
        ? Number(depositoIdParam)
        : null

    const pageParam = Number(searchParams.get("page") ?? "1")
    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1

    const pageSizeParam = Number(searchParams.get("pageSize") ?? "25")
    const pageSize =
      Number.isFinite(pageSizeParam) && pageSizeParam > 0
        ? Math.min(pageSizeParam, 100)
        : 25

    const skip = (page - 1) * pageSize

    const where: Prisma.ArticDeposWhereInput = {
      ...(depositoId ? { id_deposito: depositoId } : {}),
      ...(rawQuery
        ? {
            articulo: {
              OR: [
                { codigo: { contains: rawQuery, mode: "insensitive" } },
                { nombre: { contains: rawQuery, mode: "insensitive" } },
              ],
            },
          }
        : {}),
    }

    const [totalItems, filas] = await prisma.$transaction([
      prisma.articDepos.count({ where }),
      prisma.articDepos.findMany({
        where,
        include: {
          articulo: { include: { categoria: true, marca: true } },
          deposito: true,
        },
        orderBy: [
          { deposito: { direccion: "asc" } },
          { articulo: { nombre: "asc" } },
        ],
        skip,
        take: pageSize,
      }),
    ])

    const items = filas.map((f) => ({
      codigo: f.articulo.codigo,
      articulo: f.articulo.nombre,
      categoria: f.articulo.categoria?.nombre ?? "-",
      marca: f.articulo.marca?.nombre ?? "-",
      deposito: f.deposito.nombre,
      stock: f.stock,
      stock_min: f.stock_min,
      estado: f.stock >= f.stock_min ? "OK" : "REPONER",
    }))

    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

    return NextResponse.json({
      items,
      paginacion: {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
    })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Error interno" },
      { status: 500 },
     )
  }
} 


