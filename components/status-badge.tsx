import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type {
  AutomationStatus,
  ExecutionStatus,
  IntegrationStatus,
  LogLevel,
  ScheduleStatus,
  TriggerType,
} from "@/types"

const dot = "size-1.5 rounded-full"

const automationMap: Record<AutomationStatus, { label: string; className: string; dot: string }> = {
  active: { label: "Ativa", className: "bg-success/10 text-success", dot: "bg-success" },
  paused: { label: "Pausada", className: "bg-warning/15 text-warning", dot: "bg-warning" },
  draft: { label: "Rascunho", className: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
  error: { label: "Com erro", className: "bg-destructive/10 text-destructive", dot: "bg-destructive" },
}

const executionMap: Record<ExecutionStatus, { label: string; className: string; dot: string }> = {
  queued: { label: "Na fila", className: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
  running: { label: "Em execução", className: "bg-primary/10 text-primary", dot: "bg-primary animate-pulse" },
  completed: { label: "Concluída", className: "bg-success/10 text-success", dot: "bg-success" },
  error: { label: "Com erro", className: "bg-destructive/10 text-destructive", dot: "bg-destructive" },
  canceled: { label: "Cancelada", className: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
}

const logMap: Record<LogLevel, { label: string; className: string }> = {
  info: { label: "Info", className: "bg-primary/10 text-primary" },
  warning: { label: "Aviso", className: "bg-warning/15 text-warning" },
  error: { label: "Erro", className: "bg-destructive/10 text-destructive" },
  debug: { label: "Debug", className: "bg-muted text-muted-foreground" },
}

const triggerMap: Record<TriggerType, string> = {
  manual: "Manual",
  schedule: "Agendado",
  webhook: "Webhook",
  event: "Evento",
}

export function AutomationStatusBadge({ status }: { status: AutomationStatus }) {
  const s = automationMap[status]
  return (
    <Badge variant="ghost" className={cn(s.className)}>
      <span className={cn(dot, s.dot)} />
      {s.label}
    </Badge>
  )
}

export function ExecutionStatusBadge({ status }: { status: ExecutionStatus }) {
  const s = executionMap[status]
  return (
    <Badge variant="ghost" className={cn(s.className)}>
      <span className={cn(dot, s.dot)} />
      {s.label}
    </Badge>
  )
}

export function LogLevelBadge({ level }: { level: LogLevel }) {
  const s = logMap[level]
  return <Badge variant="ghost" className={cn(s.className)}>{s.label}</Badge>
}

export function TriggerBadge({ type }: { type: TriggerType }) {
  return <Badge variant="outline">{triggerMap[type]}</Badge>
}

export function ScheduleStatusBadge({ status }: { status: ScheduleStatus }) {
  return status === "active" ? (
    <Badge variant="ghost" className="bg-success/10 text-success">
      <span className={cn(dot, "bg-success")} />
      Ativo
    </Badge>
  ) : (
    <Badge variant="ghost" className="bg-warning/15 text-warning">
      <span className={cn(dot, "bg-warning")} />
      Pausado
    </Badge>
  )
}

export function IntegrationStatusBadge({ status }: { status: IntegrationStatus }) {
  const map: Record<IntegrationStatus, { label: string; className: string; dot: string }> = {
    connected: { label: "Conectada", className: "bg-success/10 text-success", dot: "bg-success" },
    disconnected: { label: "Desconectada", className: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
    error: { label: "Erro", className: "bg-destructive/10 text-destructive", dot: "bg-destructive" },
  }
  const s = map[status]
  return (
    <Badge variant="ghost" className={cn(s.className)}>
      <span className={cn(dot, s.dot)} />
      {s.label}
    </Badge>
  )
}
