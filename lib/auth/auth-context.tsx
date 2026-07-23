"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { useRouter } from "next/navigation"

import type { LoginCredentials, User } from "@/types"
import { authService } from "@/services/auth.service"
import { tokenStore } from "@/lib/auth/token"

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    const token = tokenStore.get()
    if (!token) {
      setIsLoading(false)
      return
    }
    authService
      .me()
      .then((u) => {
        if (active) setUser(u)
      })
      .catch(() => {
        tokenStore.clear()
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const token = await authService.login(credentials)
      tokenStore.set(token.accessToken)
      const u = await authService.me()
      setUser(u)
    },
    [],
  )

  const logout = useCallback(() => {
    tokenStore.clear()
    setUser(null)
    router.push("/login")
  }, [router])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
    }),
    [user, isLoading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider")
  return ctx
}
