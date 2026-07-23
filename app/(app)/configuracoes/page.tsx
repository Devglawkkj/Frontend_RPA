"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { LaptopIcon, LogOutIcon, MoonIcon, SunIcon } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth/auth-context"
import { formatDate } from "@/lib/format"
import type { UserRole } from "@/types"
import { cn } from "@/lib/utils"

const roleLabels: Record<UserRole, string> = {
  admin: "Administrador",
  operator: "Operador",
  viewer: "Visualizador",
}

const themeOptions = [
  { value: "light", label: "Claro", icon: SunIcon },
  { value: "dark", label: "Escuro", icon: MoonIcon },
  { value: "system", label: "Sistema", icon: LaptopIcon },
]

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Configurações" description="Gerencie seu perfil e as preferências da plataforma." />

      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Suas informações de conta.</CardDescription>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <Avatar className="size-14">
                  <AvatarFallback className="text-lg">{initials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold">{user.name}</span>
                    <Badge variant="outline">{roleLabels[user.role]}</Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">{user.email}</span>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">Usuário</span>
                  <span className="text-sm font-medium">{user.username}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className="text-sm font-medium">{user.active ? "Ativo" : "Inativo"}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">Membro desde</span>
                  <span className="text-sm font-medium">{formatDate(user.createdAt)}</span>
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Aparência</CardTitle>
          <CardDescription>Escolha como a plataforma deve ser exibida.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {themeOptions.map((option) => {
              const isActive = mounted && theme === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTheme(option.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-lg border p-4 text-sm transition-colors hover:bg-muted",
                    isActive && "border-primary bg-primary/5 text-primary",
                  )}
                >
                  <option.icon className="size-5" />
                  {option.label}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sessão</CardTitle>
          <CardDescription>Encerre sua sessão neste dispositivo.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={logout}>
            <LogOutIcon data-icon="inline-start" />
            Sair da conta
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
