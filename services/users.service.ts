import { apiClient } from "@/lib/api/client"
import { mapUser, type ApiUser } from "@/lib/api/mappers"
import { config } from "@/lib/config"
import type { User } from "@/types"
import { mockUsers } from "@/data/mocks"
import { mockDelay } from "./helpers"

export const usersService = {
  async list(): Promise<User[]> {
    if (config.useMocks) {
      return mockDelay([...mockUsers], 300)
    }
    const { data } = await apiClient.get<ApiUser[]>("/users")
    return data.map(mapUser)
  },
}
