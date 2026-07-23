import { apiClient } from "@/lib/api/client"
import { mapUser, type ApiUser } from "@/lib/api/mappers"
import { config } from "@/lib/config"
import type { AuthToken, LoginCredentials, User } from "@/types"
import { mockDelay } from "./helpers"
import { mockUser } from "@/data/mocks"

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthToken> {
    if (config.useMocks) {
      if (!credentials.username || !credentials.password) {
        throw new Error("Informe usuário e senha.")
      }
      const token = await mockDelay(
        {
          accessToken: "mock-jwt-token",
          tokenType: "bearer",
        },
        600,
      )
      return token
    }

    const { data } = await apiClient.post<{
      access_token: string
      token_type: string
    }>("/auth/login", credentials)

    return { accessToken: data.access_token, tokenType: data.token_type }
  },

  async me(): Promise<User> {
    if (config.useMocks) {
      return mockDelay(mockUser, 300)
    }
    const { data } = await apiClient.get<ApiUser>("/auth/me")
    return mapUser(data)
  },
}
