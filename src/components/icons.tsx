import { BarChart3, Boxes, Building2, DollarSign, Receipt, ShoppingCart, TrendingDown } from "lucide-react"

export const modules = [
  {
    id: "ecommerce",
    title: "E-commerce",
    description: "Gestión de catálogo y ventas online",
    href: "/e-commerce",
    icon: ShoppingCart,
    badge: "Ventas",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    id: "facturas",
    title: "Facturas de Venta",
    description: "Seguimiento de facturas generadas",
    href: "/facturasVentas",
    icon: Receipt,
    badge: "Cobros",
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    id: "ordenesPago",
    title: "Órdenes de Pago",
    description: "Pagos a proveedores",
    href: "/ordenpago",
    icon: DollarSign,
    badge: "Pagos",
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    id: "stock",
    title: "Consultar Stock",
    description: "Disponibilidad y stock mínimo",
    href: "/stock",
    icon: Boxes,
    badge: "Inventario",
    color: "bg-sky-500/10 text-sky-600",
  },
  {
    id: "proveedores",
    title: "Proveedores",
    description: "Registro y comprobantes de proveedores",
    href: "/proveedor",
    icon: Building2,
    badge: "Compras",
    color: "bg-pink-500/10 text-pink-600",
  },
  {
    id: "reportes",
    title: "Reportes",
    description: "Ingresos vs egresos y métricas",
    href: "/reportes/ingresos-egresos",
    icon: BarChart3,
    badge: "Análisis",
    color: "bg-violet-500/10 text-violet-600",
  },
]

export const quickStats = [
  {
    id: "balance",
    title: "Balance mensual",
    description: "Ingresos - egresos del mes",
    valueKey: "balance",
    icon: DollarSign,
    color: "text-emerald-600",
    background: "bg-emerald-500/10",
  },
  {
    id: "pendientes",
    title: "Órdenes de pago pendientes",
    description: "Pagos a proveedores sin completar",
    valueKey: "ordenesPendientes",
    icon: TrendingDown,
    color: "text-amber-600",
    background: "bg-amber-500/10",
  },
]
