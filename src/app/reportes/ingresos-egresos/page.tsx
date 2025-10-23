"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { format } from "date-fns"
import { es } from "date-fns/locale"

import { formatCurrency } from "@/utils/currency"

type GroupByOption = "day" | "month"
type EstadoFactura =
  | "PENDIENTE"
  | "EN_PREPARACION"
  | "ENVIADA"
  | "ENTREGADA"
  | "CANCELADA"
type EstadoOrden = "PENDIENTE" | "PAGADO" | "CANCELADO"

interface ReporteResponse {
  rango: {
    from: string
    to: string
  }
  filtros: {
    groupBy: GroupByOption
    estadoFactura: EstadoFactura
    estadoOrden: EstadoOrden
  }
  resumen: {
    ingresos: number
    egresos: number
    balance: number
  }
  series: Array<{
    label: string
    ingresos: number
    egresos: number
    balance: number
  }>
  detalleIngresos: Array<{
    id: number
    numero: string
    fecha: string
    total: number
    estado: EstadoFactura
  }>
  detalleEgresos: Array<{
    id: number
    numero: string
    fecha: string
    total: number
    estado: EstadoOrden
  }>
}

const ESTADOS_FACTURA: { value: EstadoFactura; label: string }[] = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "EN_PREPARACION", label: "En preparación" },
  { value: "ENVIADA", label: "Enviada" },
  { value: "ENTREGADA", label: "Entregada" },
  { value: "CANCELADA", label: "Cancelada" },
]

const ESTADOS_ORDEN: { value: EstadoOrden; label: string }[] = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "PAGADO", label: "Pagado" },
  { value: "CANCELADO", label: "Cancelado" },
]

const GROUP_BY_OPTIONS: { value: GroupByOption; label: string }[] = [
  { value: "day", label: "Por día" },
  { value: "month", label: "Por mes" },
]

const toInputDate = (date: Date) => format(date, "yyyy-MM-dd")

export default function ReporteIngresosEgresos() {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)

  const [from, setFrom] = useState(toInputDate(firstDay))
  const [to, setTo] = useState(toInputDate(now))
  const [groupBy, setGroupBy] = useState<GroupByOption>("month")
  const [estadoFactura, setEstadoFactura] = useState<EstadoFactura>("ENTREGADA")
  const [estadoOrden, setEstadoOrden] = useState<EstadoOrden>("PAGADO")

  const [reporte, setReporte] = useState<ReporteResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReporte = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        from,
        to,
        groupBy,
        estadoFactura,
        estadoOrden,
      })

      const response = await fetch(
        `/api/v1/reportes/ingresos-egresos?${params.toString()}`,
        {
          cache: "no-store",
        },
      )
      const data = await response.json()
      if (!response.ok || !data) {
        throw new Error(
          data?.error ??
            "No se pudo obtener la información de ingresos y egresos.",
        )
      }

      setReporte(data as ReporteResponse)
    } catch (err) {
      console.error(err)
      setReporte(null)
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error inesperado al cargar el reporte.",
      )
    } finally {
      setIsLoading(false)
    }
  }, [from, to, groupBy, estadoFactura, estadoOrden])

  useEffect(() => {
    fetchReporte()
  }, [fetchReporte])

  const resumen = reporte?.resumen
  const series = reporte?.series ?? []
  const detalleIngresos = reporte?.detalleIngresos ?? []
  const detalleEgresos = reporte?.detalleEgresos ?? []

  const formattedRange = useMemo(() => {
    if (!reporte) {
      return ""
    }
    const fromDate = new Date(reporte.rango.from)
    const toDate = new Date(reporte.rango.to)
    return `${format(fromDate, "d MMM yyyy", { locale: es })} - ${format(toDate, "d MMM yyyy", { locale: es })}`
  }, [reporte])

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Reporte: Ingresos vs Egresos</h1>
        <p className="text-base-content/70">
          Analiza lo que ingresa mediante facturas de venta y lo que egresa
          mediante órdenes de pago.
        </p>
        {formattedRange ? (
          <span className="text-sm text-base-content/60">{formattedRange}</span>
        ) : null}
      </header>

      <section className="bg-base-200 rounded-lg p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="flex flex-col space-y-1">
            <label className="text-sm text-base-content/70">Desde</label>
            <input
              type="date"
              value={from}
              max={to}
              onChange={(event) => setFrom(event.target.value)}
              className="input input-bordered input-sm"
            />
          </div>
          <div className="flex flex-col space-y-1">
            <label className="text-sm text-base-content/70">Hasta</label>
            <input
              type="date"
              value={to}
              min={from}
              onChange={(event) => setTo(event.target.value)}
              className="input input-bordered input-sm"
            />
          </div>
          <div className="flex flex-col space-y-1">
            <label className="text-sm text-base-content/70">Agrupación</label>
            <select
              value={groupBy}
              onChange={(event) => setGroupBy(event.target.value as GroupByOption)}
              className="select select-bordered select-sm"
            >
              {GROUP_BY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col space-y-1">
            <label className="text-sm text-base-content/70">
              Estado de facturas
            </label>
            <select
              value={estadoFactura}
              onChange={(event) =>
                setEstadoFactura(event.target.value as EstadoFactura)
              }
              className="select select-bordered select-sm"
            >
              {ESTADOS_FACTURA.map((estado) => (
                <option key={estado.value} value={estado.value}>
                  {estado.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col space-y-1">
            <label className="text-sm text-base-content/70">
              Estado de órdenes de pago
            </label>
            <select
              value={estadoOrden}
              onChange={(event) =>
                setEstadoOrden(event.target.value as EstadoOrden)
              }
              className="select select-bordered select-sm"
            >
              {ESTADOS_ORDEN.map((estado) => (
                <option key={estado.value} value={estado.value}>
                  {estado.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={fetchReporte}
          className="btn btn-primary btn-sm"
          disabled={isLoading}
        >
          {isLoading ? "Actualizando..." : "Actualizar"}
        </button>
      </section>

      {error ? (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      ) : null}

      {resumen ? (
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card shadow-md bg-base-200">
            <div className="card-body">
              <span className="text-sm text-base-content/70 uppercase tracking-wide">
                Ingresos
              </span>
              <h3 className="text-2xl font-bold text-success">
                {formatCurrency(resumen.ingresos)}
              </h3>
              <p className="text-xs text-base-content/60">
                Facturas de venta en el rango seleccionado
              </p>
            </div>
          </div>
          <div className="card shadow-md bg-base-200">
            <div className="card-body">
              <span className="text-sm text-base-content/70 uppercase tracking-wide">
                Egresos
              </span>
              <h3 className="text-2xl font-bold text-error">
                {formatCurrency(resumen.egresos)}
              </h3>
              <p className="text-xs text-base-content/60">
                Órdenes de pago en el rango seleccionado
              </p>
            </div>
          </div>
          <div className="card shadow-md bg-base-200">
            <div className="card-body">
              <span className="text-sm text-base-content/70 uppercase tracking-wide">
                Balance
              </span>
              <h3
                className={`text-2xl font-bold ${
                  resumen.balance >= 0 ? "text-success" : "text-error"
                }`}
              >
                {formatCurrency(resumen.balance)}
              </h3>
              <p className="text-xs text-base-content/60">
                Diferencia entre ingresos y egresos
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="card bg-base-100 shadow-md">
        <div className="card-body">
          <h2 className="card-title text-lg">Evolución de ingresos y egresos</h2>
          <p className="text-sm text-base-content/60">
            Comparativa temporal según la agrupación seleccionada.
          </p>
          {series.length === 0 ? (
            <div className="text-sm text-base-content/60 py-6">
              No hay información para los filtros seleccionados.
            </div>
          ) : (
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={series} barCategoryGap="16%">
                  <CartesianGrid strokeDasharray="4 4" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      formatCurrency(value),
                      name,
                    ]}
                  />
                  <Legend />
                  <Bar
                    dataKey="ingresos"
                    name="Ingresos"
                    fill="#22c55e"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar
                    dataKey="egresos"
                    name="Egresos"
                    fill="#ef4444"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h3 className="card-title text-lg">Detalle de ingresos</h3>
            <p className="text-sm text-base-content/60">
              Facturas consideradas en el cálculo.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Número</th>
                    <th>Estado</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {detalleIngresos.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-sm">
                        No se registraron facturas en el período.
                      </td>
                    </tr>
                  ) : (
                    detalleIngresos.map((item) => (
                      <tr key={item.id}>
                        <td>
                          {format(new Date(item.fecha), "dd/MM/yyyy", {
                            locale: es,
                          })}
                        </td>
                        <td>{item.numero}</td>
                        <td>{item.estado}</td>
                        <td className="text-right">
                          {formatCurrency(item.total)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h3 className="card-title text-lg">Detalle de egresos</h3>
            <p className="text-sm text-base-content/60">
              Órdenes de pago consideradas en el cálculo.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Número</th>
                    <th>Estado</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {detalleEgresos.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-sm">
                        No se registraron órdenes de pago en el período.
                      </td>
                    </tr>
                  ) : (
                    detalleEgresos.map((item) => (
                      <tr key={item.id}>
                        <td>
                          {format(new Date(item.fecha), "dd/MM/yyyy", {
                            locale: es,
                          })}
                        </td>
                        <td>{item.numero}</td>
                        <td>{item.estado}</td>
                        <td className="text-right">
                          {formatCurrency(item.total)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
