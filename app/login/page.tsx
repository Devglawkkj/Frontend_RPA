"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { BotIcon, CalendarClockIcon, LineChartIcon, ShieldCheckIcon } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { LoginForm } from "@/components/auth/login-form"
import { useAuth } from "@/lib/auth/auth-context"

const highlights = [
  { icon: BotIcon, title: "Automações centralizadas", desc: "Gerencie todos os seus robôs em um só lugar." },
  { icon: LineChartIcon, title: "Métricas em tempo real", desc: "Acompanhe execuções e taxa de sucesso." },
  { icon: CalendarClockIcon, title: "Agendamentos flexíveis", desc: "Defina gatilhos e horários com facilidade." },
  { icon: ShieldCheckIcon, title: "Seguro por padrão", desc: "Autenticação JWT e controle de acesso." },
]

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading || isAuthenticated) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    )
  }

  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      {/* Brand / marketing panel */}
      <section className="relative hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary-foreground/15">
            <BotIcon className="size-5" />
          </div>
          <span className="text-lg font-semibold">RPA Dashboard</span>
        </div>

        <div className="flex flex-col gap-6">
          <h1 className="max-w-md text-3xl font-semibold text-balance">
            Orquestre suas automações com controle total.
          </h1>
          <div className="grid gap-4 sm:grid-cols-2">
            {highlights.map((h) => (
              <div key={h.title} className="flex flex-col gap-2 rounded-xl bg-primary-foreground/10 p-4">
                <h.icon className="size-5" />
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium">{h.title}</p>
                  <p className="text-sm text-primary-foreground/70 text-pretty">{h.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-primary-foreground/60">
          © {new Date().getFullYear()} RPA Dashboard. Todos os direitos reservados.
        </p>
      </section>

      {/* Form panel */}
      <section className="flex items-center justify-center p-6">
        <Card className="w-full max-w-sm border-none shadow-none">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground lg:hidden">
              <BotIcon className="size-6" />
            </div>
            <CardTitle className="text-2xl">Acessar plataforma</CardTitle>
            <CardDescription>
              Entre com suas credenciais para continuar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
