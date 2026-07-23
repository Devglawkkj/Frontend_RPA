"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeftIcon, LoaderCircleIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useCreateAutomation } from "@/hooks/api/use-automations"
import { getApiErrorMessage } from "@/lib/api/errors"

const stepSchema = z.object({
  name: z.string().min(1, "Informe o nome da etapa."),
  type: z.string().min(1, "Informe o tipo."),
  description: z.string().optional(),
})

const schema = z.object({
  name: z.string().min(1, "Informe o nome da automação."),
  description: z.string().min(1, "Informe uma descrição."),
  category: z.string().min(1, "Informe a categoria."),
  triggerType: z.enum(["manual", "schedule", "webhook", "event"]),
  schedule: z.string().optional(),
  steps: z.array(stepSchema).min(1, "Adicione ao menos uma etapa."),
  retryOnError: z.boolean(),
  maxRetries: z.number().min(0).max(10),
  notifyOnError: z.boolean(),
})

type FormValues = z.infer<typeof schema>

const triggerOptions = [
  { value: "manual", label: "Manual" },
  { value: "schedule", label: "Agendado" },
  { value: "webhook", label: "Webhook" },
  { value: "event", label: "Evento" },
]

export default function NewAutomationPage() {
  const router = useRouter()
  const createAutomation = useCreateAutomation()

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      triggerType: "manual",
      schedule: "",
      steps: [{ name: "", type: "", description: "" }],
      retryOnError: true,
      maxRetries: 3,
      notifyOnError: true,
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: "steps" })
  const triggerType = watch("triggerType")
  const retryOnError = watch("retryOnError")
  const notifyOnError = watch("notifyOnError")

  async function onSubmit(values: FormValues) {
    try {
      const created = await createAutomation.mutateAsync({
        ...values,
        steps: values.steps.map((s) => ({
          name: s.name,
          type: s.type,
          description: s.description || undefined,
        })),
      })
      toast.success("Automação criada com sucesso.")
      router.push(`/automacoes/${created.id}`)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" className="w-fit" render={<Link href="/automacoes" />}>
          <ArrowLeftIcon data-icon="inline-start" />
          Voltar para automações
        </Button>
        <PageHeader title="Nova automação" description="Configure um novo robô de automação." />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações gerais</CardTitle>
            <CardDescription>Nome, descrição e categoria da automação.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="name">Nome</FieldLabel>
                <Input id="name" placeholder="Ex: Conciliação bancária diária" {...register("name")} />
                <FieldError errors={errors.name ? [errors.name] : undefined} />
              </Field>

              <Field data-invalid={!!errors.description}>
                <FieldLabel htmlFor="description">Descrição</FieldLabel>
                <Textarea
                  id="description"
                  rows={3}
                  placeholder="O que essa automação faz?"
                  {...register("description")}
                />
                <FieldError errors={errors.description ? [errors.description] : undefined} />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={!!errors.category}>
                  <FieldLabel htmlFor="category">Categoria</FieldLabel>
                  <Input id="category" placeholder="Ex: Financeiro" {...register("category")} />
                  <FieldError errors={errors.category ? [errors.category] : undefined} />
                </Field>

                <Field>
                  <FieldLabel htmlFor="triggerType">Gatilho</FieldLabel>
                  <Select
                    value={triggerType}
                    onValueChange={(v) => setValue("triggerType", v as FormValues["triggerType"])}
                  >
                    <SelectTrigger id="triggerType" className="w-full">
                      <SelectValue placeholder="Selecione o gatilho" />
                    </SelectTrigger>
                    <SelectContent>
                      {triggerOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              {triggerType === "schedule" ? (
                <Field>
                  <FieldLabel htmlFor="schedule">Agendamento</FieldLabel>
                  <Input
                    id="schedule"
                    placeholder="Ex: Todos os dias às 06:00"
                    {...register("schedule")}
                  />
                </Field>
              ) : null}
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Etapas do fluxo</CardTitle>
            <CardDescription>Defina a sequência de ações que a automação executará.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex flex-col gap-3 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Etapa {index + 1}</span>
                  {fields.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Remover etapa"
                      onClick={() => remove(index)}
                    >
                      <Trash2Icon />
                    </Button>
                  ) : null}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field data-invalid={!!errors.steps?.[index]?.name}>
                    <FieldLabel htmlFor={`steps.${index}.name`}>Nome</FieldLabel>
                    <Input
                      id={`steps.${index}.name`}
                      placeholder="Ex: Baixar extrato"
                      {...register(`steps.${index}.name` as const)}
                    />
                    <FieldError errors={errors.steps?.[index]?.name ? [errors.steps[index]!.name!] : undefined} />
                  </Field>
                  <Field data-invalid={!!errors.steps?.[index]?.type}>
                    <FieldLabel htmlFor={`steps.${index}.type`}>Tipo</FieldLabel>
                    <Input
                      id={`steps.${index}.type`}
                      placeholder="Ex: download, integration, logic..."
                      {...register(`steps.${index}.type` as const)}
                    />
                    <FieldError errors={errors.steps?.[index]?.type ? [errors.steps[index]!.type!] : undefined} />
                  </Field>
                </div>
                <Field>
                  <FieldLabel htmlFor={`steps.${index}.description`}>Descrição (opcional)</FieldLabel>
                  <Input
                    id={`steps.${index}.description`}
                    placeholder="Detalhes da etapa"
                    {...register(`steps.${index}.description` as const)}
                  />
                </Field>
              </div>
            ))}
            {errors.steps?.root ? (
              <p className="text-sm text-destructive">{errors.steps.root.message}</p>
            ) : null}
            <Button
              type="button"
              variant="outline"
              className="w-fit"
              onClick={() => append({ name: "", type: "", description: "" })}
            >
              <PlusIcon data-icon="inline-start" />
              Adicionar etapa
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Opções avançadas</CardTitle>
            <CardDescription>Comportamento em caso de falha.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">Tentar novamente em caso de erro</span>
                <span className="text-sm text-muted-foreground">
                  A automação será reexecutada automaticamente até o limite definido.
                </span>
              </div>
              <Switch
                checked={retryOnError}
                onCheckedChange={(v) => setValue("retryOnError", !!v)}
              />
            </div>

            {retryOnError ? (
              <Field className="max-w-40">
                <FieldLabel htmlFor="maxRetries">Máximo de tentativas</FieldLabel>
                <Input
                  id="maxRetries"
                  type="number"
                  min={0}
                  max={10}
                  {...register("maxRetries", { valueAsNumber: true })}
                />
              </Field>
            ) : null}

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">Notificar em caso de erro</span>
                <span className="text-sm text-muted-foreground">
                  Envie um alerta para os responsáveis quando a automação falhar.
                </span>
              </div>
              <Switch
                checked={notifyOnError}
                onCheckedChange={(v) => setValue("notifyOnError", !!v)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" render={<Link href="/automacoes" />}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />}
            Criar automação
          </Button>
        </div>
      </form>
    </div>
  )
}
