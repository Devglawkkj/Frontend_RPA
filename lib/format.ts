import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export function formatDateTime(iso?: string): string {
  if (!iso) return "—"
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso))
}

export function formatDate(iso?: string): string {
  if (!iso) return "—"
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(iso))
}

export function formatRelative(iso?: string): string {
  if (!iso) return "—"
  return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: ptBR })
}

export function formatDuration(seconds?: number): string {
  if (seconds == null) return "—"
  if (seconds < 60) return `${seconds}s`
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  if (min < 60) return `${min}m ${sec}s`
  const hours = Math.floor(min / 60)
  return `${hours}h ${min % 60}m`
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value)
}

export function formatPercent(value: number): string {
  return `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(value)}%`
}
