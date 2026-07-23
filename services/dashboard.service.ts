import { apiClient } from "@/lib/api/client"
import {
  mapChartPoint,
  mapMetrics,
  type ApiChartPoint,
  type ApiMetrics,
} from "@/lib/api/mappers"
import { config } from "@/lib/config"
import type { ChartPeriod, ChartPoint, DashboardMetrics } from "@/types"
import { buildChart, buildMetrics } from "@/data/mocks"
import { mockDelay } from "./helpers"

export const dashboardService = {
  async metrics(): Promise<DashboardMetrics> {
    if (config.useMocks) {
      return mockDelay(buildMetrics(), 350)
    }
    const { data } = await apiClient.get<ApiMetrics>("/dashboard/metrics")
    return mapMetrics(data)
  },

  async executionsChart(period: ChartPeriod): Promise<ChartPoint[]> {
    if (config.useMocks) {
      return mockDelay(buildChart(period), 400)
    }
    const { data } = await apiClient.get<ApiChartPoint[]>(
      "/dashboard/executions-chart",
      { params: { period } },
    )
    return data.map(mapChartPoint)
  },
}
