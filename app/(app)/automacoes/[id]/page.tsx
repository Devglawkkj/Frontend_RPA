"use client"

import { use, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeftIcon,
  CalendarClockIcon,
  PauseIcon,
  PlayIcon,
  Trash2Icon,
  UserIcon,
} from "lucide-react"
import { toast } from "sonner"

import { QueryError, EmptyState } from "@/components/query-state"
import { AutomationStatusBadge, ExecutionStatusBadge, TriggerBadge } from "@/components/status-badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAutomation, useAutomationAction, useDeleteAutomation } from "@/hooks/api/use-automations"
import { useExecutions } from "@/hooks/api/use-executions"
import { getApiErrorMessage } from "@/lib/api/errors"
import { formatDateTime, formatPercent, formatRelative } from "@/lib/format"

export default function AutomationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const automationQuery = useAutomation(id)
  const executionsQuery = useExecutions({ page: 1, pageSize: 8 })
  const action = useAutomationAction()
  const remove = useDeleteAutomation()

  const automation = automationQuery.data
  const executions = executionsQuery.data?.items.filter((e) => e.automationId === id) ?? []

  function runAction(act: "run" | "pause" | "activate") {
    action.mutate(
      { id, action: act },
      {
        onSuccess: () => {
          const messages = { run: "Execução iniciada.", pause: "Automação pausada.", activate: "Automação ativada." }
          toast.success(messages[act])
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    )
  }

  function handleDelete() {
    remove.mutate(id, {
      onSuccess: () => {
        toast.success("Automação removida.")
        router.push("/automacoes")
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error))
        setConfirmDelete(false)
      },
    })
  }

  if (automationQuery.isError) {
    return (
      <div className="flex flex-col gap-6">
        <Button variant="ghost" size="sm" className="w-fit" onClick={() => router.push("/automacoes")}>
          <ArrowLeftIcon data-icon="inline-start" />
          Voltar
        </Button>
        <QueryError error={automationQuery.error} onRetry={() => automationQuery.refetch()} />
      </div>
    )
  }

  if (automationQuery.isPending || !automation) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" className="w-fit" render={<Link href="/automacoes" />}>
          <ArrowLeftIcon data-icon="inline-start" />
          Voltar para automações
        </Button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold tracking-tight text-balance">{automation.name}</h2>
              <AutomationStatusBadge status={automation.status} />
            </div>
            <p className="max-w-2xl text-sm text-muted-foreground text-pretty">{automation.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {automation.status === "active" ? (
              <Button variant="outline" onClick={() => runAction("pause")} disabled={action.isPending}>
                <PauseIcon data-icon="inline-start" />
                Pausar
              </Button>
            ) : (
              <Button variant="outline" onClick={() => runAction("activate")} disabled={action.isPending}>
                <PlayIcon data-icon="inline-start" />
                Ativar
              </Button>
            )}
            <Button onClick={() => runAction("run")} disabled={action.isPending}>
              <PlayIcon data-icon="inline-start" />
              Executar agora
            </Button>
            <Button variant="destructive" size="icon" aria-label="Excluir" onClick={() => setConfirmDelete(true)}>
              <Trash2Icon />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Taxa de sucesso</span>
            <span className="text-2xl font-semibold">{formatPercent(automation.successRate)}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Total de execuções</span>
            <span className="text-2xl font-semibold">{automation.totalRuns}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Última execução</span>
            <span className="text-2xl font-semibold">{formatRelative(automation.lastRunAt)}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Gatilho</span>
            <div className="mt-0.5">
              <TriggerBadge type={automation.triggerType} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Etapas do fluxo</CardTitle>
          </CardHeader>
          <CardContent>
            {automation.steps.length === 0 ? (
              <EmptyState title="Sem etapas configuradas" />
            ) : (
              <ol className="flex flex-col gap-3">
                {automation.steps.map((step, i) => (
                  <li key={step.id} className="flex items-start gap-3 rounded-lg border p-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                      {i + 1}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">{step.name}</span>
                      {step.description ? (
                        <span className="text-xs text-muted-foreground">{step.description}</span>
                      ) : null}
                      <Badge variant="outline" className="mt-1 w-fit">
                        {step.type}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detalhes</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <UserIcon className="size-4" />
              Responsável: <span className="text-foreground">{automation.owner}</span>
            </div>
            {automation.schedule ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarClockIcon className="size-4" />
                {automation.schedule}
              </div>
            ) : null}
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">Categoria</span>
              <span>{automation.category}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">Criada em</span>
              <span>{formatDateTime(automation.createdAt)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">Atualizada em</span>
              <span>{formatDateTime(automation.updatedAt)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de execuções</CardTitle>
        </CardHeader>
        <CardContent>
          {executionsQuery.isPending ? (
            <Skeleton className="h-40 w-full" />
          ) : executions.length === 0 ? (
            <EmptyState title="Nenhuma execução registrada" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Disparado por</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {executions.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>
                      <ExecutionStatusBadge status={e.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDateTime(e.startedAt)}</TableCell>
                    <TableCell className="text-muted-foreground">{e.triggeredBy}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir automação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A automação "{automation.name}" será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete} disabled={remove.isPending}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
