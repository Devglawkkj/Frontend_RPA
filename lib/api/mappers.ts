import type {
  Automation,
  AutomationInput,
  ChartPoint,
  DashboardMetrics,
  Execution,
  Integration,
  LogEntry,
  Schedule,
  ScheduleInput,
  User,
} from "@/types"

// ---------------------------------------------------------------------------
// Raw API shapes (snake_case) as returned by the FastAPI backend.
// ---------------------------------------------------------------------------

export interface ApiUser {
  id: string | number
  username: string
  name?: string
  full_name?: string
  email: string
  role?: string
  avatar_url?: string
  is_active?: boolean
  created_at?: string
}

export interface ApiAutomation {
  id: string | number
  name: string
  description?: string
  status?: string
  trigger_type?: string
  category?: string
  owner?: string
  steps?: { id?: string | number; name: string; type: string; description?: string }[]
  schedule?: string
  success_rate?: number
  last_run_at?: string
  total_runs?: number
  created_at?: string
  updated_at?: string
}

export interface ApiExecution {
  id: string | number
  automation_id: string | number
  automation_name?: string
  status?: string
  started_at?: string
  finished_at?: string
  duration_seconds?: number
  progress?: number
  triggered_by?: string
  error_message?: string
}

export interface ApiMetrics {
  total_automations?: number
  active_automations?: number
  executions_today?: number
  executions_with_error?: number
  success_rate?: number
  hours_saved?: number
}

export interface ApiChartPoint {
  date: string
  completed?: number
  error?: number
}

export interface ApiLog {
  id: string | number
  timestamp: string
  level?: string
  automation_id?: string | number
  automation_name?: string
  execution_id?: string | number
  message: string
  source?: string
}

export interface ApiSchedule {
  id: string | number
  automation_id: string | number
  automation_name?: string
  cron: string
  human_readable?: string
  timezone?: string
  status?: string
  next_run_at?: string
  last_run_at?: string
}

export interface ApiIntegration {
  id: string | number
  name: string
  category?: string
  description?: string
  status?: string
  connected_at?: string
}

// ---------------------------------------------------------------------------
// Mappers: API (snake_case) -> Domain (camelCase)
// ---------------------------------------------------------------------------

export function mapUser(u: ApiUser): User {
  return {
    id: String(u.id),
    username: u.username,
    name: u.name ?? u.full_name ?? u.username,
    email: u.email,
    role: (u.role as User["role"]) ?? "viewer",
    avatarUrl: u.avatar_url,
    active: u.is_active ?? true,
    createdAt: u.created_at ?? new Date().toISOString(),
  }
}

export function mapAutomation(a: ApiAutomation): Automation {
  return {
    id: String(a.id),
    name: a.name,
    description: a.description ?? "",
    status: (a.status as Automation["status"]) ?? "draft",
    triggerType: (a.trigger_type as Automation["triggerType"]) ?? "manual",
    category: a.category ?? "Geral",
    owner: a.owner ?? "—",
    steps: (a.steps ?? []).map((s, i) => ({
      id: String(s.id ?? i),
      name: s.name,
      type: s.type,
      description: s.description,
    })),
    schedule: a.schedule,
    successRate: a.success_rate ?? 0,
    lastRunAt: a.last_run_at,
    totalRuns: a.total_runs ?? 0,
    createdAt: a.created_at ?? new Date().toISOString(),
    updatedAt: a.updated_at ?? new Date().toISOString(),
  }
}

export function mapAutomationInput(input: AutomationInput): Record<string, unknown> {
  return {
    name: input.name,
    description: input.description,
    category: input.category,
    trigger_type: input.triggerType,
    steps: input.steps,
    schedule: input.schedule,
    retry_on_error: input.retryOnError,
    max_retries: input.maxRetries,
    notify_on_error: input.notifyOnError,
  }
}

export function mapExecution(e: ApiExecution): Execution {
  return {
    id: String(e.id),
    automationId: String(e.automation_id),
    automationName: e.automation_name ?? "—",
    status: (e.status as Execution["status"]) ?? "queued",
    startedAt: e.started_at ?? new Date().toISOString(),
    finishedAt: e.finished_at,
    durationSeconds: e.duration_seconds,
    progress: e.progress ?? 0,
    triggeredBy: e.triggered_by ?? "—",
    errorMessage: e.error_message,
  }
}

export function mapMetrics(m: ApiMetrics): DashboardMetrics {
  return {
    totalAutomations: m.total_automations ?? 0,
    activeAutomations: m.active_automations ?? 0,
    executionsToday: m.executions_today ?? 0,
    executionsWithError: m.executions_with_error ?? 0,
    successRate: m.success_rate ?? 0,
    hoursSaved: m.hours_saved ?? 0,
  }
}

export function mapChartPoint(p: ApiChartPoint): ChartPoint {
  return {
    date: p.date,
    completed: p.completed ?? 0,
    error: p.error ?? 0,
  }
}

export function mapLog(l: ApiLog): LogEntry {
  return {
    id: String(l.id),
    timestamp: l.timestamp,
    level: (l.level as LogEntry["level"]) ?? "info",
    automationId: l.automation_id ? String(l.automation_id) : undefined,
    automationName: l.automation_name,
    executionId: l.execution_id ? String(l.execution_id) : undefined,
    message: l.message,
    source: l.source ?? "system",
  }
}

export function mapSchedule(s: ApiSchedule): Schedule {
  return {
    id: String(s.id),
    automationId: String(s.automation_id),
    automationName: s.automation_name ?? "—",
    cron: s.cron,
    humanReadable: s.human_readable ?? s.cron,
    timezone: s.timezone ?? "America/Sao_Paulo",
    status: (s.status as Schedule["status"]) ?? "active",
    nextRunAt: s.next_run_at,
    lastRunAt: s.last_run_at,
  }
}

export function mapScheduleInput(input: ScheduleInput): Record<string, unknown> {
  return {
    automation_id: input.automationId,
    cron: input.cron,
    timezone: input.timezone,
    status: input.status,
  }
}

export function mapIntegration(i: ApiIntegration): Integration {
  return {
    id: String(i.id),
    name: i.name,
    category: i.category ?? "Geral",
    description: i.description ?? "",
    status: (i.status as Integration["status"]) ?? "disconnected",
    connectedAt: i.connected_at,
  }
}
