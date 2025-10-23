import Link from "next/link"
import type { LucideIcon } from "lucide-react"

interface ModuleCardProps {
  title: string
  description: string
  href: string
  badge?: string
  icon: LucideIcon
  color?: string
}

export const ModuleCard = ({
  title,
  description,
  href,
  badge,
  icon: Icon,
  color = "bg-primary/10 text-primary",
}: ModuleCardProps) => {
  return (
    <Link
      href={href}
      className="group relative flex flex-col justify-between border border-base-200 bg-base-100 shadow-sm rounded-2xl p-5 transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 text-sm text-base-content/60">
            {badge ? <span className="uppercase tracking-wide text-xs">{badge}</span> : null}
          </div>
          <h3 className="mt-2 text-lg font-semibold text-base-content">{title}</h3>
          <p className="mt-1 text-sm text-base-content/70">{description}</p>
        </div>
        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between text-sm font-medium text-primary">
        <span>Acceder</span>
        <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
      </div>
    </Link>
  )
}
