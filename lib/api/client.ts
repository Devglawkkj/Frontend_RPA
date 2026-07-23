import axios from "axios"

import { config } from "@/lib/config"
import { tokenStore } from "@/lib/auth/token"

// Centralized axios instance. Every domain service imports this instance so
// the base URL, JWT header, and 401 handling live in exactly one place.

export const apiClient = axios.create({
  baseURL: config.apiUrl,
  headers: { "Content-Type": "application/json" },
})

// Attach the JWT to every request.
apiClient.interceptors.request.use((request) => {
  const token = tokenStore.get()
  if (token) {
    request.headers.Authorization = `Bearer ${token}`
  }
  return request
})

// On 401, clear the session and redirect to /login (client-side only).
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    if (status === 401 && typeof window !== "undefined") {
      tokenStore.clear()
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  },
)
