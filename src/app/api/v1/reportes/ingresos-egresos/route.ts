"use server"

import { NextResponse } from "next/server"
import { prisma } from "@/prisma/instance"
import type { EstadoFacturaVenta, EstadoOrdenPago } from "@/generated/prisma"

type GroupByOption = "day" | "month"

const startOfDay = (date: Date) => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

const endOfDay = (date: Date) => {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

const parseISODate = (value: string | null): Date | null => {
  if (!value) return null
  const isoPattern = /^\d{4}-\d{2}-\d{2}$/
  if (!isoPattern.test(value)) return null
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? null : date
}

const VALID_FACTURA_ESTADOS: EstadoFacturaVenta[] = [
  "PENDIENTE",
  "EN_PREPARACION",
  "ENVIADA",
  "ENTREGADA",
  "CANCELADA",
]

const VALID_ORDEN_ESTADOS: EstadoOrdenPago[] = ["PENDIENTE", "PAGADO", "CANCELADO"]

const GROUP_OPTIONS: GroupByOption[] = ["day", "month"]

const formatKey = (date: Date, groupBy: GroupByOption) => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")

  if (groupBy === "month") {
    return { key: `${year}-${month}`, label: `${month}/${year}` }
  }

  return { key: `${year}-${month}-${day}`, label: `${day}/${month}/${year}` }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const fromParam = parseISODate(searchParams.get("from"))
    const toParam = parseISODate(searchParams.get("to"))

    const now = new Date()
    const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1)
    const defaultTo = now

    const from = startOfDay(fromParam ?? defaultFrom)
    const to = endOfDay(toParam ?? defaultTo)

    if (from > to) {
      return NextResponse.json(
        { error: "El parámetro 'from' debe ser anterior o igual a 'to'." },
        { status: 400 },
      )
    }

    const groupByParam = (searchParams.get("groupBy") ?? "month").toLowerCase()
    const groupBy: GroupByOption = GROUP_OPTIONS.includes(groupByParam as GroupByOption)
      ? (groupByParam as GroupByOption)
      : "month"

    const estadoFacturaParam = searchParams.get("estadoFactura")
    const estadoFactura =
      estadoFacturaParam && VALID_FACTURA_ESTADOS.includes(estadoFacturaParam as EstadoFacturaVenta)
        ? (estadoFacturaParam as EstadoFacturaVenta)
        : "ENTREGADA"

    const estadoOrdenParam = searchParams.get("estadoOrden")
    const estadoOrden =
      estadoOrdenParam && VALID_ORDEN_ESTADOS.includes(estadoOrdenParam as EstadoOrdenPago)
        ? (estadoOrdenParam as EstadoOrdenPago)
        : "PAGADO"

    const [facturas, ordenes] = await Promise.all([
      prisma.facturaVenta.findMany({
        where: {
          fecha_emision: { gte: from, lte: to },
          ...(estadoFactura ? { estado: estadoFactura } : {}),
        },
        select: {
          id: true,
          numero: true,
          fecha_emision: true,
          total: true,
          estado: true,
        },
        orderBy: { fecha_emision: "asc" },
      }),
      prisma.ordenPago.findMany({
        where: {
          fecha: { gte: from, lte: to },
          ...(estadoOrden ? { estado: estadoOrden } : {}),
        },
        select: {
          id: true,
          numero: true,
          fecha: true,
          total: true,
          estado: true,
        },
        orderBy: { fecha: "asc" },
      }),
    ])

    const seriesMap = new Map<
      string,
      { label: string; ingresos: number; egresos: number }
    >()

    const addToSeries = (date: Date, amount: number, type: "ingresos" | "egresos") => {
      const { key, label } = formatKey(date, groupBy)
      if (!seriesMap.has(key)) {
        seriesMap.set(key, { label, ingresos: 0, egresos: 0 })
      }
      const entry = seriesMap.get(key)!
      entry[type] += amount
    }

    let totalIngresos = 0
    const detalleIngresos = facturas.map((factura) => {
      const monto = Number(factura.total ?? 0)
      totalIngresos += monto
      addToSeries(factura.fecha_emision, monto, "ingresos")
      return {
        id: factura.id,
        numero: factura.numero,
        fecha: factura.fecha_emision,
        total: monto,
        estado: factura.estado,
      }
    })

    let totalEgresos = 0
    const detalleEgresos = ordenes.map((orden) => {
      const monto = Number(orden.total ?? 0)
      totalEgresos += monto
      addToSeries(orden.fecha, monto, "egresos")
      return {
        id: orden.id,
        numero: orden.numero,
        fecha: orden.fecha,
        total: monto,
        estado: orden.estado,
      }
    })

    const series = Array.from(seriesMap.entries())
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([, value]) => ({
        label: value.label,
        ingresos: value.ingresos,
        egresos: value.egresos,
        balance: value.ingresos - value.egresos,
      }))

    return NextResponse.json({
      rango: {
        from: from.toISOString(),
        to: to.toISOString(),
      },
      filtros: {
        groupBy,
        estadoFactura,
        estadoOrden,
      },
      resumen: {
        ingresos: totalIngresos,
        egresos: totalEgresos,
        balance: totalIngresos - totalEgresos,
      },
      series,
      detalleIngresos,
      detalleEgresos,
    })
  } catch (error) {
    console.error("[reportes][ingresos-egresos]", error)
    return NextResponse.json(
      { error: "No se pudo generar el reporte de ingresos vs egresos." },
      { status: 500 },
    )
  }
}
