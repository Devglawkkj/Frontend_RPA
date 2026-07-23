"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { LoaderCircleIcon, MoreHorizontalIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/page-header"
import { QueryError, EmptyState } from "@/components/query-state"
import { ScheduleStatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
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
import { useAutomations } from "@/hooks/api/use-automations"
import {
  useCreateSchedule,
  useDeleteSchedule,
  useSchedules,
  useUpdateSchedule,
} from "@/hooks/api/use-misc"
import { getApiErrorMessage } from "@/lib/api/errors"
import { formatRelative } from "@/lib/format"
import type { Schedule } from "@/types"

const schema = z.object({
  automationId: z.string().min(1, "Selecione uma automação."),
  cron: z.string().min(1, "Informe a expressão cron."),
  timezone: z.string().min(1, "Informe o fuso horário."),
  status: z.enum(["active", "paused"]),
})

type FormValues = z.infer<typeof schema>

export default function SchedulesPage() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Schedule | null>(null)
  const [deleteId, setDeleteTarget] = useState<string | null>(null)

  const schedulesQuery = useSchedules()
  const automationsQuery = useAutomations({ page: 1, pageSize: 100 })
  const createSchedule = useCreateSchedule()
  const updateSchedule = useUpdateSchedule()
  const deleteSchedule = useDeleteSchedule()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { automationId: "", cron: "", timezone: "America/Sao_Paulo", status: "active" },
  })

  const automationId = watch("automationId")
  const status = watch("status")

  useEffect(() => {
    if (open) {
      reset(
        editing
          ? {
              automationId: editing.automationId,
              cron: editing.cron,
              timezone: editing.timezone,
              status: editing.status,
            }
          : { automationId: "", cron: "", timezone: "America/Sao_Paulo", status: "active" },
      )
    }
  }, [open, editing, reset])

  function openCreate() {
    setEditing(null)
    setOpen(true)
  }

  function openEdit(schedule: Schedule) {
    setEditing(schedule)
    setOpen(true)
  }

  async function onSubmit(values: FormValues) {
    try {
      if (editing) {
        await updateSchedule.mutateAsync({ id: editing.id, input: values })
        toast.success("Agendamento atualizado.")
      } else {
        await createSchedule.mutateAsync(values)
        toast.success("Agendamento criado.")
      }
      setOpen(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  function confirmDelete() {
    if (!deleteId) return
    deleteSchedule.mutate(deleteId, {
      onSuccess: () => {
        toast.success("Agendamento removido.")
        setDeleteTarget(null)
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error))
        setDeleteTarget(null)
      },
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Agendamentos"
        description="Configure quando cada automação deve ser executada."
        actions={
          <Button onClick={openCreate}>
            <PlusIcon data-icon="inline-start" />
            Novo agendamento
          </Button>
        }
      />

      {schedulesQuery.isError ? (
        <QueryError error={schedulesQuery.error} onRetry={() => schedulesQuery.refetch()} />
      ) : schedulesQuery.isPending ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : schedulesQuery.data.length === 0 ? (
        <EmptyState
          title="Nenhum agendamento configurado"
          description="Crie um agendamento para automatizar a execução de um robô."
          action={
            <Button onClick={openCreate}>
              <PlusIcon data-icon="inline-start" />
              Novo agendamento
            </Button>
          }
        />
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Automação</TableHead>
                <TableHead>Expressão cron</TableHead>
                <TableHead>Fuso horário</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Próxima execução</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedulesQuery.data.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.automationName}</TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{s.cron}</code>
                    <span className="ml-2 text-xs text-muted-foreground">{s.humanReadable}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{s.timezone}</TableCell>
                  <TableCell>
                    <ScheduleStatusBadge status={s.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatRelative(s.nextRunAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon-sm" aria-label="Mais ações">
                            <MoreHorizontalIcon />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(s)}>Editar</DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            updateSchedule.mutate(
                              { id: s.id, input: { status: s.status === "active" ? "paused" : "active" } },
                              {
                                onSuccess: () =>
                                  toast.success(s.status === "active" ? "Agendamento pausado." : "Agendamento ativado."),
                                onError: (error) => toast.error(getApiErrorMessage(error)),
                              },
                            )
                          }
                        >
                          {s.status === "active" ? "Pausar" : "Ativar"}
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(s.id)}>
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
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar agendamento" : "Novo agendamento"}</DialogTitle>
            <DialogDescription>Defina a automação, a expressão cron e o fuso horário.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field data-invalid={!!errors.automationId}>
                <FieldLabel htmlFor="automationId">Automação</FieldLabel>
                <Select value={automationId} onValueChange={(v) => setValue("automationId", v as string)}>
                  <SelectTrigger id="automationId" className="w-full">
                    <SelectValue placeholder="Selecione uma automação" />
                  </SelectTrigger>
                  <SelectContent>
                    {automationsQuery.data?.items.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={errors.automationId ? [errors.automationId] : undefined} />
              </Field>

              <Field data-invalid={!!errors.cron}>
                <FieldLabel htmlFor="cron">Expressão cron</FieldLabel>
                <Input id="cron" placeholder="Ex: 0 6 * * *" {...register("cron")} />
                <FieldError errors={errors.cron ? [errors.cron] : undefined} />
              </Field>

              <Field data-invalid={!!errors.timezone}>
                <FieldLabel htmlFor="timezone">Fuso horário</FieldLabel>
                <Input id="timezone" placeholder="Ex: America/Sao_Paulo" {...register("timezone")} />
                <FieldError errors={errors.timezone ? [errors.timezone] : undefined} />
              </Field>

              <Field>
                <FieldLabel htmlFor="status">Status</FieldLabel>
                <Select value={status} onValueChange={(v) => setValue("status", v as FormValues["status"])}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="paused">Pausado</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />}
                {editing ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir agendamento?</DialogTitle>
            <DialogDescription>Esta ação não pode ser desfeita.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteSchedule.isPending}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
