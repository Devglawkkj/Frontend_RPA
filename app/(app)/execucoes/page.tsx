"use client"

import { useState } from "react"
import Link from "next/link"
import { RotateCwIcon, SearchIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/page-header"
import { QueryError, EmptyState } from "@/components/query-state"
import { ExecutionStatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useExecutionAction, useExecutions } from "@/hooks/api/use-executions"
import { getApiErrorMessage } from "@/lib/api/errors"
import { formatDateTime, formatDuration } from "@/lib/format"

const statusOptions = [
  { value: "all", label: "Todos os status" },
  { value: "queued", label: "Na fila" },
  { value: "running", label: "Em execução" },
  { value: "completed", label: "Concluída" },
  { value: "error", label: "Com erro" },
  { value: "canceled", label: "Cancelada" },
]

export default function ExecutionsPage() {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [page, setPage] = useState(1)
  const pageSize = 15

  const query = useExecutions({ search: search || undefined, status, page, pageSize }, { poll: true })
  const action = useExecutionAction()

  const totalPages = query.data ? Math.max(1, Math.ceil(query.data.total / pageSize)) : 1

  function handleAction(id: string, act: "retry" | "cancel") {
    action.mutate(
      { id, action: act },
      {
        onSuccess: () => toast.success(act === "retry" ? "Execução reiniciada." : "Execução cancelada."),
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Execuções"
        description="Monitore em tempo real todas as execuções das suas automações."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por automação ou responsável..."
            className="pl-8"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v as string)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {query.isError ? (
        <QueryError error={query.error} onRetry={() => query.refetch()} />
      ) : query.isPending ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : query.data.items.length === 0 ? (
        <EmptyState title="Nenhuma execução encontrada" description="Ajuste os filtros para ver mais resultados." />
      ) : (
        <>
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Automação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progresso</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Disparado por</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.data.items.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">
                      <Link href={`/automacoes/${e.automationId}`} className="hover:underline">
                        {e.automationName}
                      </Link>
                      {e.errorMessage ? (
                        <p className="mt-0.5 text-xs text-destructive">{e.errorMessage}</p>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <ExecutionStatusBadge status={e.status} />
                    </TableCell>
                    <TableCell className="w-32">
                      {e.status === "running" ? (
                        <div className="flex items-center gap-2">
                          <Progress value={e.progress} className="h-1.5 w-20" />
                          <span className="text-xs text-muted-foreground">{e.progress}%</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDateTime(e.startedAt)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDuration(e.durationSeconds)}</TableCell>
                    <TableCell className="text-muted-foreground">{e.triggeredBy}</TableCell>
                    <TableCell>
                      {e.status === "error" || e.status === "canceled" ? (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Tentar novamente"
                          onClick={() => handleAction(e.id, "retry")}
                        >
                          <RotateCwIcon />
                        </Button>
                      ) : e.status === "running" || e.status === "queued" ? (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Cancelar"
                          onClick={() => handleAction(e.id, "cancel")}
                        >
                          <XIcon />
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 ? (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Página {page} de {totalPages} · {query.data.total} execuções
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Próxima
                </Button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
