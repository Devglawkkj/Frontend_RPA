"use client"

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import type { ListParams } from "@/types"
import { executionsService } from "@/services/executions.service"
import { queryKeys } from "./keys"

export function useExecutions(params?: ListParams, options?: { poll?: boolean }) {
  return useQuery({
    queryKey: queryKeys.executions.list(params),
    queryFn: () => executionsService.list(params),
    // Keep running executions fresh by polling every 5 seconds.
    refetchInterval: options?.poll ? 5000 : false,
  })
}

export function useExecution(id: string, options?: { poll?: boolean }) {
  return useQuery({
    queryKey: queryKeys.executions.detail(id),
    queryFn: () => executionsService.get(id),
    enabled: !!id,
    refetchInterval: options?.poll ? 5000 : false,
  })
}

export function useExecutionAction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "retry" | "cancel" }) =>
      executionsService[action](id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.executions.all })
    },
  })
}
