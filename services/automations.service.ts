import { apiClient } from "@/lib/api/client"
import {
  mapAutomation,
  mapAutomationInput,
  type ApiAutomation,
} from "@/lib/api/mappers"
import { config } from "@/lib/config"
import type {
  Automation,
  AutomationInput,
  ListParams,
  Paginated,
} from "@/types"
import { mockAutomations } from "@/data/mocks"
import { filterBySearch, mockDelay, paginate } from "./helpers"

export const automationsService = {
  async list(params?: ListParams): Promise<Paginated<Automation>> {
    if (config.useMocks) {
      let items = filterBySearch(mockAutomations, params?.search, (a) => [
        a.name,
        a.description,
        a.category,
        a.owner,
      ])
      if (params?.status && params.status !== "all") {
        items = items.filter((a) => a.status === params.status)
      }
      return mockDelay(paginate(items, params))
    }

    const { data } = await apiClient.get<{ items: ApiAutomation[]; total: number }>(
      "/automations",
      { params: mapListParams(params) },
    )
    const items = (Array.isArray(data) ? data : data.items).map(mapAutomation)
    return {
      items,
      total: Array.isArray(data) ? items.length : data.total,
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 10,
    }
  },

  async get(id: string): Promise<Automation> {
    if (config.useMocks) {
      const found = mockAutomations.find((a) => a.id === id)
      if (!found) throw new Error("Automação não encontrada.")
      return mockDelay(found, 300)
    }
    const { data } = await apiClient.get<ApiAutomation>(`/automations/${id}`)
    return mapAutomation(data)
  },

  async create(input: AutomationInput): Promise<Automation> {
    if (config.useMocks) {
      const created: Automation = {
        id: String(Date.now()),
        name: input.name,
        description: input.description,
        status: "draft",
        triggerType: input.triggerType,
        category: input.category,
        owner: "Ana Ribeiro",
        steps: input.steps.map((s, i) => ({ id: String(i), ...s })),
        schedule: input.schedule,
        successRate: 0,
        totalRuns: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      mockAutomations.unshift(created)
      return mockDelay(created, 500)
    }
    const { data } = await apiClient.post<ApiAutomation>(
      "/automations",
      mapAutomationInput(input),
    )
    return mapAutomation(data)
  },

  async update(id: string, input: Partial<AutomationInput>): Promise<Automation> {
    if (config.useMocks) {
      const found = mockAutomations.find((a) => a.id === id)
      if (!found) throw new Error("Automação não encontrada.")
      Object.assign(found, input, { updatedAt: new Date().toISOString() })
      return mockDelay(found, 400)
    }
    const { data } = await apiClient.put<ApiAutomation>(
      `/automations/${id}`,
      mapAutomationInput(input as AutomationInput),
    )
    return mapAutomation(data)
  },

  async remove(id: string): Promise<void> {
    if (config.useMocks) {
      const idx = mockAutomations.findIndex((a) => a.id === id)
      if (idx >= 0) mockAutomations.splice(idx, 1)
      await mockDelay(null, 400)
      return
    }
    await apiClient.delete(`/automations/${id}`)
  },

  async run(id: string): Promise<void> {
    if (config.useMocks) return mockDelay(undefined, 400)
    await apiClient.post(`/automations/${id}/run`)
  },

  async pause(id: string): Promise<void> {
    if (config.useMocks) {
      const found = mockAutomations.find((a) => a.id === id)
      if (found) found.status = "paused"
      return mockDelay(undefined, 300)
    }
    await apiClient.post(`/automations/${id}/pause`)
  },

  async activate(id: string): Promise<void> {
    if (config.useMocks) {
      const found = mockAutomations.find((a) => a.id === id)
      if (found) found.status = "active"
      return mockDelay(undefined, 300)
    }
    await apiClient.post(`/automations/${id}/activate`)
  },
}

function mapListParams(params?: ListParams) {
  if (!params) return {}
  return {
    page: params.page,
    page_size: params.pageSize,
    search: params.search,
    status: params.status,
  }
}
