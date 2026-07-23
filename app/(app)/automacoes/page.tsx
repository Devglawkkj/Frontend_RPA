"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  MoreHorizontalIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/page-header"
import { QueryError, EmptyState } from "@/components/query-state"
import { AutomationStatusBadge, TriggerBadge } from "@/components/status-badge"
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
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import {
  useAutomationAction,
  useAutomations,
  useDeleteAutomation,
} from "@/hooks/api/use-automations"
import { formatPercent, formatRelative } from "@/lib/format"
import { getApiErrorMessage } from "@/lib/api/errors"

const statusOptions = [
  { value: "all", label: "Todos os status" },
  { value: "active", label: "Ativa" },
  { value: "paused", label: "Pausada" },
  { value: "draft", label: "Rascunho" },
  { value: "error", label: "Com erro" },
]

export default function AutomationsPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const pageSize = 10

  const query = useAutomations({ search: search || undefined, status, page, pageSize })
  const action = useAutomationAction()
  const remove = useDeleteAutomation()

  const totalPages = query.data ? Math.max(1, Math.ceil(query.data.total / pageSize)) : 1

  function runAction(id: string, act: "run" | "pause" | "activate") {
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

  function confirmDelete() {
    if (!deleteId) return
    remove.mutate(deleteId, {
      onSuccess: () => {
        toast.success("Automação removida.")
        setDeleteId(null)
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error))
        setDeleteId(null)
      },
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Automações"
        description="Gerencie os robôs de automação da sua operação."
        actions={
          <Button render={<Link href="/automacoes/nova" />}>
            <PlusIcon data-icon="inline-start" />
            Nova automação
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, categoria ou responsável..."
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
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : query.data.items.length === 0 ? (
        <EmptyState
          title="Nenhuma automação encontrada"
          description="Ajuste os filtros ou crie uma nova automação."
          action={
            <Button render={<Link href="/automacoes/nova" />}>
              <PlusIcon data-icon="inline-start" />
              Nova automação
            </Button>
          }
        />
      ) : (
        <>
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Gatilho</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Sucesso</TableHead>
                  <TableHead>Última execução</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.data.items.map((a) => (
                  <TableRow key={a.id} className="cursor-pointer" onClick={() => router.push(`/automacoes/${a.id}`)}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{a.name}</span>
                        <span className="text-xs text-muted-foreground">{a.owner}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <AutomationStatusBadge status={a.status} />
                    </TableCell>
                    <TableCell>
                      <TriggerBadge type={a.triggerType} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{a.category}</TableCell>
                    <TableCell className="text-muted-foreground">{formatPercent(a.successRate)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatRelative(a.lastRunAt)}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon-sm" aria-label="Mais ações">
                              <MoreHorizontalIcon />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => runAction(a.id, "run")}>
                            <PlayIcon />
                            Executar agora
                          </DropdownMenuItem>
                          {a.status === "active" ? (
                            <DropdownMenuItem onClick={() => runAction(a.id, "pause")}>
                              <PauseIcon />
                              Pausar
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => runAction(a.id, "activate")}>
                              <PlayIcon />
                              Ativar
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem variant="destructive" onClick={() => setDeleteId(a.id)}>
                            <Trash2Icon />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 ? (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Página {page} de {totalPages} · {query.data.total} automações
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

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir automação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A automação e seu histórico de configuração serão removidos
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete} disabled={remove.isPending}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
