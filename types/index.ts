// ---------------------------------------------------------------------------
// Domain types (camelCase) used across the frontend.
// API responses arrive in snake_case and are converted by the mappers.
// ---------------------------------------------------------------------------

export type ID = string

// --- Auth -----------------------------------------------------------------

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthToken {
  accessToken: string
  tokenType: string
}

export type UserRole = "admin" | "operator" | "viewer"

export interface User {
  id: ID
  username: string
  name: string
  email: string
  role: UserRole
  avatarUrl?: string
  active: boolean
  createdAt: string
}

// --- Automations ----------------------------------------------------------

export type AutomationStatus = "active" | "paused" | "draft" | "error"

export type TriggerType = "manual" | "schedule" | "webhook" | "event"

export interface AutomationStep {
  id: ID
  name: string
  type: string
  description?: string
}

export interface Automation {
  id: ID
  name: string
  description: string
  status: AutomationStatus
  triggerType: TriggerType
  category: string
  owner: string
  steps: AutomationStep[]
  schedule?: string
  successRate: number
  lastRunAt?: string
  totalRuns: number
  createdAt: string
  updatedAt: string
}

export interface AutomationInput {
  name: string
  description: string
  category: string
  triggerType: TriggerType
  steps: { name: string; type: string; description?: string }[]
  schedule?: string
  retryOnError: boolean
  maxRetries: number
  notifyOnError: boolean
}

// --- Executions -----------------------------------------------------------

export type ExecutionStatus =
  | "queued"
  | "running"
  | "completed"
  | "error"
  | "canceled"

export interface Execution {
  id: ID
  automationId: ID
  automationName: string
  status: ExecutionStatus
  startedAt: string
  finishedAt?: string
  durationSeconds?: number
  progress: number
  triggeredBy: string
  errorMessage?: string
}

// --- Dashboard ------------------------------------------------------------

export type ChartPeriod = "7d" | "30d" | "90d"

export interface DashboardMetrics {
  totalAutomations: number
  activeAutomations: number
  executionsToday: number
  executionsWithError: number
  successRate: number
  hoursSaved: number
}

export interface ChartPoint {
  date: string
  completed: number
  error: number
}

// --- Logs -----------------------------------------------------------------

export type LogLevel = "info" | "warning" | "error" | "debug"

export interface LogEntry {
  id: ID
  timestamp: string
  level: LogLevel
  automationId?: ID
  automationName?: string
  executionId?: ID
  message: string
  source: string
}

// --- Schedules ------------------------------------------------------------

export type ScheduleStatus = "active" | "paused"

export interface Schedule {
  id: ID
  automationId: ID
  automationName: string
  cron: string
  humanReadable: string
  timezone: string
  status: ScheduleStatus
  nextRunAt?: string
  lastRunAt?: string
}

export interface ScheduleInput {
  automationId: ID
  cron: string
  timezone: string
  status: ScheduleStatus
}

// --- Integrations ---------------------------------------------------------

export type IntegrationStatus = "connected" | "disconnected" | "error"

export interface Integration {
  id: ID
  name: string
  category: string
  description: string
  status: IntegrationStatus
  connectedAt?: string
}

// --- Notifications ----------------------------------------------------------

export interface Notification {
  id: ID
  title: string
  message: string
  createdAt: string
  read: boolean
}

// --- Shared ---------------------------------------------------------------

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface ListParams {
  page?: number
  pageSize?: number
  search?: string
  status?: string
}
