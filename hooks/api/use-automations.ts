"use client"

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import type { AutomationInput, ListParams } from "@/types"
import { automationsService } from "@/services/automations.service"
import { queryKeys } from "./keys"

export function useAutomations(params?: ListParams) {
  return useQuery({
    queryKey: queryKeys.automations.list(params),
    queryFn: () => automationsService.list(params),
  })
}

export function useAutomation(id: string) {
  return useQuery({
    queryKey: queryKeys.automations.detail(id),
    queryFn: () => automationsService.get(id),
    enabled: !!id,
  })
}

export function useCreateAutomation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: AutomationInput) => automationsService.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.automations.all })
    },
  })
}

export function useUpdateAutomation(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<AutomationInput>) =>
      automationsService.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.automations.all })
      qc.invalidateQueries({ queryKey: queryKeys.automations.detail(id) })
    },
  })
}

export function useDeleteAutomation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => automationsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.automations.all })
    },
  })
}

type AutomationAction = "run" | "pause" | "activate"

export function useAutomationAction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: AutomationAction }) =>
      automationsService[action](id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.automations.all })
      qc.invalidateQueries({ queryKey: queryKeys.executions.all })
    },
  })
}
