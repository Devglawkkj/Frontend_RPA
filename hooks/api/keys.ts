import type { ChartPeriod, ListParams } from "@/types"

export const queryKeys = {
  dashboard: {
    metrics: ["dashboard", "metrics"] as const,
    chart: (period: ChartPeriod) => ["dashboard", "chart", period] as const,
  },
  automations: {
    all: ["automations"] as const,
    list: (params?: ListParams) => ["automations", "list", params] as const,
    detail: (id: string) => ["automations", "detail", id] as const,
  },
  executions: {
    all: ["executions"] as const,
    list: (params?: ListParams) => ["executions", "list", params] as const,
    detail: (id: string) => ["executions", "detail", id] as const,
  },
  logs: {
    list: (params?: ListParams) => ["logs", "list", params] as const,
  },
  schedules: {
    all: ["schedules"] as const,
  },
  integrations: {
    all: ["integrations"] as const,
  },
  users: {
    all: ["users"] as const,
  },
}
