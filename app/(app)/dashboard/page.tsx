"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
} from "recharts"
import {
  ActivityIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  ClockIcon,
  TriangleAlertIcon,
  WorkflowIcon,
} from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { QueryError, EmptyState } from "@/components/query-state"
import { AutomationStatusBadge, ExecutionStatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useDashboardMetrics, useExecutionsChart } from "@/hooks/api/use-dashboard"
import { useAutomations } from "@/hooks/api/use-automations"
import { useExecutions } from "@/hooks/api/use-executions"
import { formatDuration, formatNumber, formatPercent, formatRelative } from "@/lib/format"
import type { ChartPeriod } from "@/types"

const chartConfig: ChartConfig = {
  completed: { label: "Concluídas", color: "var(--color-success, #16a34a)" },
  error: { label: "Com erro", color: "var(--color-destructive, #dc2626)" },
}

const periods: { value: ChartPeriod; label: string }[] = [
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
  { value: "90d", label: "90 dias" },
]

export default function DashboardPage() {
  const [period, setPeriod] = useState<ChartPeriod>("7d")
  const metricsQuery = useDashboardMetrics()
  const chartQuery = useExecutionsChart(period)
  const automationsQuery = useAutomations({ page: 1, pageSize: 5 })
  const executionsQuery = useExecutions({ page: 1, pageSize: 6 }, { poll: true })

  const metrics = metricsQuery.data

  const cards = [
    {
      label: "Automações ativas",
      value: metrics ? `${formatNumber(metrics.activeAutomations)} / ${formatNumber(metrics.totalAutomations)}` : undefined,
      icon: WorkflowIcon,
    },
    {
      label: "Execuções hoje",
      value: metrics ? formatNumber(metrics.executionsToday) : undefined,
      icon: ActivityIcon,
    },
    {
      label: "Taxa de sucesso",
      value: metrics ? formatPercent(metrics.successRate) : undefined,
      icon: CheckCircle2Icon,
    },
    {
      label: "Horas economizadas",
      value: metrics ? `${formatNumber(metrics.hoursSaved)}h` : undefined,
      icon: ClockIcon,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Visão geral"
        description="Acompanhe o desempenho das suas automações em tempo real."
      />

      {metricsQuery.isError ? (
        <QueryError error={metricsQuery.error} onRetry={() => metricsQuery.refetch()} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <Card key={c.label}>
              <CardContent className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">{c.label}</span>
                  {c.value === undefined ? (
                    <Skeleton className="h-7 w-16" />
                  ) : (
                    <span className="text-2xl font-semibold tracking-tight">{c.value}</span>
                  )}
                </div>
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <c.icon className="size-5" />
                </div>
              </CardContent>
            </Card>
          ))}
          {metrics && metrics.executionsWithError > 0 ? (
            <Card className="sm:col-span-2 lg:col-span-4 border-destructive/30 bg-destructive/5">
              <CardContent className="flex items-center gap-3">
                <TriangleAlertIcon className="size-5 text-destructive" />
                <p className="text-sm text-destructive">
                  {formatNumber(metrics.executionsWithError)} execuç{metrics.executionsWithError === 1 ? "ão" : "ões"} com erro hoje. Revise nos logs para mais detalhes.
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Execuções ao longo do tempo</CardTitle>
              <CardDescription>Concluídas versus com erro</CardDescription>
            </div>
            <Tabs value={period} onValueChange={(v) => setPeriod(v as ChartPeriod)}>
              <TabsList>
                {periods.map((p) => (
                  <TabsTrigger key={p.value} value={p.value}>
                    {p.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {chartQuery.isError ? (
              <QueryError error={chartQuery.error} onRetry={() => chartQuery.refetch()} />
            ) : chartQuery.isPending ? (
              <Skeleton className="h-[240px] w-full" />
            ) : (
              <ChartContainer config={chartConfig} className="h-[240px] w-full">
                <AreaChart data={chartQuery.data} margin={{ left: 0, right: 12 }}>
                  <defs>
                    <linearGradient id="fillCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-completed)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--color-completed)" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="fillError" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-error)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--color-error)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(v) =>
                      new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(new Date(v))
                    }
                  />
                  <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                  <Area
                    dataKey="completed"
                    type="monotone"
                    fill="url(#fillCompleted)"
                    stroke="var(--color-completed)"
                    strokeWidth={2}
                  />
                  <Area
                    dataKey="error"
                    type="monotone"
                    fill="url(#fillError)"
                    stroke="var(--color-error)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Principais automações</CardTitle>
            <CardDescription>Ordenadas por atualização recente</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {automationsQuery.isError ? (
              <QueryError error={automationsQuery.error} onRetry={() => automationsQuery.refetch()} />
            ) : automationsQuery.isPending ? (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
            ) : automationsQuery.data.items.length === 0 ? (
              <EmptyState title="Nenhuma automação" description="Crie sua primeira automação para começar." />
            ) : (
              automationsQuery.data.items.map((a) => (
                <Link
                  key={a.id}
                  href={`/automacoes/${a.id}`}
                  className="flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 -mx-2 transition-colors hover:bg-muted"
                >
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-sm font-medium">{a.name}</span>
                    <span className="text-xs text-muted-foreground">{a.category}</span>
                  </div>
                  <AutomationStatusBadge status={a.status} />
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Execuções recentes</CardTitle>
            <CardDescription>Atualizado automaticamente a cada 5 segundos</CardDescription>
          </div>
          <Button variant="outline" size="sm" render={<Link href="/execucoes" />}>
            Ver todas
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        </CardHeader>
        <CardContent>
          {executionsQuery.isError ? (
            <QueryError error={executionsQuery.error} onRetry={() => executionsQuery.refetch()} />
          ) : executionsQuery.isPending ? (
            <Skeleton className="h-48 w-full" />
          ) : executionsQuery.data.items.length === 0 ? (
            <EmptyState title="Nenhuma execução" description="As execuções aparecerão aqui assim que ocorrerem." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Automação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Disparado por</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {executionsQuery.data.items.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">
                      <Link href={`/automacoes/${e.automationId}`} className="hover:underline">
                        {e.automationName}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <ExecutionStatusBadge status={e.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatRelative(e.startedAt)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDuration(e.durationSeconds)}</TableCell>
                    <TableCell className="text-muted-foreground">{e.triggeredBy}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
