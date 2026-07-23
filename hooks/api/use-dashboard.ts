"use client"

import { useQuery } from "@tanstack/react-query"

import type { ChartPeriod } from "@/types"
import { dashboardService } from "@/services/dashboard.service"
import { queryKeys } from "./keys"

export function useDashboardMetrics() {
  return useQuery({
    queryKey: queryKeys.dashboard.metrics,
    queryFn: () => dashboardService.metrics(),
  })
}

export function useExecutionsChart(period: ChartPeriod) {
  return useQuery({
    queryKey: queryKeys.dashboard.chart(period),
    queryFn: () => dashboardService.executionsChart(period),
  })
}
