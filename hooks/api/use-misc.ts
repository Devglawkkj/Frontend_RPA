"use client"

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import type { ListParams, ScheduleInput } from "@/types"
import { logsService } from "@/services/logs.service"
import { schedulesService } from "@/services/schedules.service"
import { integrationsService } from "@/services/integrations.service"
import { usersService } from "@/services/users.service"
import { queryKeys } from "./keys"

export function useLogs(params?: ListParams) {
  return useQuery({
    queryKey: queryKeys.logs.list(params),
    queryFn: () => logsService.list(params),
  })
}

export function useSchedules() {
  return useQuery({
    queryKey: queryKeys.schedules.all,
    queryFn: () => schedulesService.list(),
  })
}

export function useCreateSchedule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: ScheduleInput) => schedulesService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.schedules.all }),
  })
}

export function useUpdateSchedule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ScheduleInput> }) =>
      schedulesService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.schedules.all }),
  })
}

export function useDeleteSchedule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => schedulesService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.schedules.all }),
  })
}

export function useIntegrations() {
  return useQuery({
    queryKey: queryKeys.integrations.all,
    queryFn: () => integrationsService.list(),
  })
}

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users.all,
    queryFn: () => usersService.list(),
  })
}
