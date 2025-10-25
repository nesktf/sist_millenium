"use client"

import { useEffect, useState } from "react"
import { modules, quickStats } from "@/components/icons"
import { ModuleCard } from "@/components/dashboard/ModuleCard"
import { QuickStatCard } from "@/components/dashboard/QuickStatCard"
import { format } from "date-fns"
import { es } from "date-fns/locale"

const statsInitialData = {
  balance: 0,
  ordenesPendientes: 0,
}

export default function DashboardPage() {
  const [fechaFormateada, setFechaFormateada] = useState("")
  const [stats, setStats] = useState(statsInitialData)

  useEffect(() => {
    setFechaFormateada(
      format(new Date(), "EEEE d 'de' MMMM yyyy", {
        locale: es,
      }),
    )
  }, [])

  useEffect(() => {
    let cancelled = false

    const fetchStats = async () => {
      try {
        const today = new Date()
        const startMonth = new Date(today.getFullYear(), today.getMonth(), 1)

        const params = new URLSearchParams({
          from: format(startMonth, "yyyy-MM-dd"),
          to: format(today, "yyyy-MM-dd"),
          groupBy: "month",
        })

        const [reporteRes, ordenesPendientesRes] = await Promise.all([
          fetch(`/api/v1/reportes/ingresos-egresos?${params.toString()}`, {
            cache: "no-store",
          }),
          fetch(`/api/v1/orden-pago?estado=PENDIENTE`, {
            cache: "no-store",
          }),
        ])

        let balance = 0
        if (reporteRes.ok) {
          const data = await reporteRes.json()
          balance = Number(data?.resumen?.balance ?? 0)
        }

        let pendientes = 0
        if (ordenesPendientesRes.ok) {
          const data = await ordenesPendientesRes.json()
          pendientes = Array.isArray(data) ? data.length : 0
        }

        if (!cancelled) {
          setStats({
            balance,
            ordenesPendientes: pendientes,
          })
        }
      } catch (error) {
        console.error("Error cargando estadísticas del dashboard", error)
        if (!cancelled) {
          setStats(statsInitialData)
        }
      }
    }

    fetchStats()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="min-h-screen bg-base-200/60 p-6 sm:p-8 space-y-8">
      <header className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h1 className="text-3xl font-bold text-base-content">Panel de Gestión</h1>
            <p className="text-sm text-base-content/70">
              Supervisá ventas, pagos, stock y reportes del sistema Millenium.
            </p>
          </div>
          <div className="text-sm text-base-content/70">
            {fechaFormateada || ""}
          </div>
        </div>
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body py-4">
            <h2 className="text-lg font-semibold text-base-content">
              Bienvenido/a
            </h2>
            <p className="text-sm text-base-content/70">
              Accedé rápidamente a los módulos y revisá métricas clave del negocio.
            </p>
          </div>
        </div>
      </header>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-base-content">Módulos disponibles</h3>
          <span className="text-sm text-base-content/60">
            Accesos directos a las principales áreas del sistema.
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {modules.map((module) => (
            <ModuleCard key={module.id} {...module} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-base-content">Indicadores rápidos</h3>
          <span className="text-sm text-base-content/60">
            Valores demonstrativos hasta conectar con datos reales.
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickStats.map((stat) => (
            <QuickStatCard
              key={stat.id}
              title={stat.title}
              description={stat.description}
              value={stats[stat.valueKey as keyof typeof stats] ?? 0}
              icon={stat.icon}
              color={stat.color}
              background={stat.background}
            />
          ))}
        </div>
      </section>
    </main>
  )
}
