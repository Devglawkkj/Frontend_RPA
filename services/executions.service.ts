import { apiClient } from "@/lib/api/client"
import { mapExecution, type ApiExecution } from "@/lib/api/mappers"
import { config } from "@/lib/config"
import type { Execution, ListParams, Paginated } from "@/types"
import { mockExecutions } from "@/data/mocks"
import { filterBySearch, mockDelay, paginate } from "./helpers"

export const executionsService = {
  async list(params?: ListParams): Promise<Paginated<Execution>> {
    if (config.useMocks) {
      // Simulate progress advancing on running executions each poll.
      mockExecutions.forEach((e) => {
        if (e.status === "running") {
          e.progress = Math.min(99, e.progress + Math.round(Math.random() * 6))
        }
      })
      let items = filterBySearch(mockExecutions, params?.search, (e) => [
        e.automationName,
        e.triggeredBy,
      ])
      if (params?.status && params.status !== "all") {
        items = items.filter((e) => e.status === params.status)
      }
      return mockDelay(paginate(items, params), 300)
    }
    const { data } = await apiClient.get<{ items: ApiExecution[]; total: number }>(
      "/executions",
      { params },
    )
    const items = (Array.isArray(data) ? data : data.items).map(mapExecution)
    return {
      items,
      total: Array.isArray(data) ? items.length : data.total,
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 10,
    }
  },

  async get(id: string): Promise<Execution> {
    if (config.useMocks) {
      const found = mockExecutions.find((e) => e.id === id)
      if (!found) throw new Error("Execução não encontrada.")
      return mockDelay(found, 250)
    }
    const { data } = await apiClient.get<ApiExecution>(`/executions/${id}`)
    return mapExecution(data)
  },

  async retry(id: string): Promise<void> {
    if (config.useMocks) {
      const found = mockExecutions.find((e) => e.id === id)
      if (found) {
        found.status = "running"
        found.progress = 5
      }
      return mockDelay(undefined, 300)
    }
    await apiClient.post(`/executions/${id}/retry`)
  },

  async cancel(id: string): Promise<void> {
    if (config.useMocks) {
      const found = mockExecutions.find((e) => e.id === id)
      if (found) found.status = "canceled"
      return mockDelay(undefined, 300)
    }
    await apiClient.post(`/executions/${id}/cancel`)
  },
}
