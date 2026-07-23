import { apiClient } from "@/lib/api/client"
import { mapIntegration, type ApiIntegration } from "@/lib/api/mappers"
import { config } from "@/lib/config"
import type { Integration } from "@/types"
import { mockIntegrations } from "@/data/mocks"
import { mockDelay } from "./helpers"

export const integrationsService = {
  async list(): Promise<Integration[]> {
    if (config.useMocks) {
      return mockDelay([...mockIntegrations], 300)
    }
    const { data } = await apiClient.get<ApiIntegration[]>("/integrations")
    return data.map(mapIntegration)
  },
}
