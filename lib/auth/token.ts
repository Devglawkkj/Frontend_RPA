import { TOKEN_STORAGE_KEY } from "@/lib/config"

// Centralized token storage. Kept in a single module so both the axios
// interceptor and the auth context read/write from one source of truth.

let inMemoryToken: string | null = null

export const tokenStore = {
  get(): string | null {
    if (inMemoryToken) return inMemoryToken
    if (typeof window === "undefined") return null
    inMemoryToken = window.localStorage.getItem(TOKEN_STORAGE_KEY)
    return inMemoryToken
  },
  set(token: string) {
    inMemoryToken = token
    if (typeof window !== "undefined") {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
    }
  },
  clear() {
    inMemoryToken = null
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY)
    }
  },
}
