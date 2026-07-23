"use client"

import { useState } from "react"
import { SearchIcon } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { QueryError, EmptyState } from "@/components/query-state"
import { LogLevelBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLogs } from "@/hooks/api/use-misc"
import { formatDateTime } from "@/lib/format"

const levelOptions = [
  { value: "all", label: "Todos os níveis" },
  { value: "info", label: "Info" },
  { value: "warning", label: "Aviso" },
  { value: "error", label: "Erro" },
  { value: "debug", label: "Debug" },
]

export default function LogsPage() {
  const [search, setSearch] = useState("")
  const [level, setLevel] = useState("all")
  const [page, setPage] = useState(1)
  const pageSize = 20

  const query = useLogs({ search: search || undefined, status: level, page, pageSize })
  const totalPages = query.data ? Math.max(1, Math.ceil(query.data.total / pageSize)) : 1

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Logs" description="Consulte os registros de execução de todas as automações." />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por mensagem, automação ou origem..."
            className="pl-8"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>
        <Select
          value={level}
          onValueChange={(v) => {
            setLevel(v as string)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Nível" />
          </SelectTrigger>
          <SelectContent>
            {levelOptions.map((o) => (
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
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : query.data.items.length === 0 ? (
        <EmptyState title="Nenhum log encontrado" description="Ajuste os filtros para ver mais resultados." />
      ) : (
        <>
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-40">Data/hora</TableHead>
                  <TableHead className="w-24">Nível</TableHead>
                  <TableHead>Mensagem</TableHead>
                  <TableHead>Automação</TableHead>
                  <TableHead>Origem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.data.items.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatDateTime(log.timestamp)}
                    </TableCell>
                    <TableCell>
                      <LogLevelBadge level={log.level} />
                    </TableCell>
                    <TableCell className="max-w-md truncate" title={log.message}>
                      {log.message}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{log.automationName ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{log.source}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 ? (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Página {page} de {totalPages} · {query.data.total} registros
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
