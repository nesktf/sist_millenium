import type { LucideIcon } from "lucide-react"
import { formatCurrency } from "@/utils/currency"

interface QuickStatCardProps {
  title: string
  description: string
  value: number
  icon: LucideIcon
  color?: string
  background?: string
}

export const QuickStatCard = ({
  title,
  description,
  value,
  icon: Icon,
  color = "text-primary",
  background = "bg-primary/10",
}: QuickStatCardProps) => {
  const formatted = formatCurrency(value)
  return (
    <div className="border border-base-200 bg-base-100 shadow-sm rounded-xl p-4 flex items-center gap-4">
      <div className={`h-12 w-12 rounded-full flex items-center justify-center ${background} ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-base-content/60">{title}</p>
        <p className="text-xl font-semibold text-base-content">{formatted}</p>
        <p className="text-xs text-base-content/60">{description}</p>
      </div>
    </div>
  )
}
