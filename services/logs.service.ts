import { apiClient } from "@/lib/api/client"
import { mapLog, type ApiLog } from "@/lib/api/mappers"
import { config } from "@/lib/config"
import type { ListParams, LogEntry, Paginated } from "@/types"
import { mockLogs } from "@/data/mocks"
import { filterBySearch, mockDelay, paginate } from "./helpers"

export const logsService = {
  async list(params?: ListParams): Promise<Paginated<LogEntry>> {
    if (config.useMocks) {
      let items = filterBySearch(mockLogs, params?.search, (l) => [
        l.message,
        l.automationName ?? "",
        l.source,
      ])
      if (params?.status && params.status !== "all") {
        items = items.filter((l) => l.level === params.status)
      }
      return mockDelay(paginate(items, params), 300)
    }
    const { data } = await apiClient.get<{ items: ApiLog[]; total: number }>(
      "/logs",
      { params },
    )
    const items = (Array.isArray(data) ? data : data.items).map(mapLog)
    return {
      items,
      total: Array.isArray(data) ? items.length : data.total,
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 10,
    }
  },
}
