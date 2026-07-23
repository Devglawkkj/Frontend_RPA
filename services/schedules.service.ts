import { apiClient } from "@/lib/api/client"
import {
  mapSchedule,
  mapScheduleInput,
  type ApiSchedule,
} from "@/lib/api/mappers"
import { config } from "@/lib/config"
import type { Schedule, ScheduleInput } from "@/types"
import { mockAutomations, mockSchedules } from "@/data/mocks"
import { mockDelay } from "./helpers"

export const schedulesService = {
  async list(): Promise<Schedule[]> {
    if (config.useMocks) {
      return mockDelay([...mockSchedules], 300)
    }
    const { data } = await apiClient.get<ApiSchedule[]>("/schedules")
    return data.map(mapSchedule)
  },

  async create(input: ScheduleInput): Promise<Schedule> {
    if (config.useMocks) {
      const automation = mockAutomations.find((a) => a.id === input.automationId)
      const created: Schedule = {
        id: String(Date.now()),
        automationId: input.automationId,
        automationName: automation?.name ?? "—",
        cron: input.cron,
        humanReadable: input.cron,
        timezone: input.timezone,
        status: input.status,
      }
      mockSchedules.unshift(created)
      return mockDelay(created, 400)
    }
    const { data } = await apiClient.post<ApiSchedule>(
      "/schedules",
      mapScheduleInput(input),
    )
    return mapSchedule(data)
  },

  async update(id: string, input: Partial<ScheduleInput>): Promise<Schedule> {
    if (config.useMocks) {
      const found = mockSchedules.find((s) => s.id === id)
      if (!found) throw new Error("Agendamento não encontrado.")
      Object.assign(found, input)
      return mockDelay(found, 400)
    }
    const { data } = await apiClient.put<ApiSchedule>(
      `/schedules/${id}`,
      mapScheduleInput(input as ScheduleInput),
    )
    return mapSchedule(data)
  },

  async remove(id: string): Promise<void> {
    if (config.useMocks) {
      const idx = mockSchedules.findIndex((s) => s.id === id)
      if (idx >= 0) mockSchedules.splice(idx, 1)
      return mockDelay(undefined, 300)
    }
    await apiClient.delete(`/schedules/${id}`)
  },
}
