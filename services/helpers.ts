import type { ListParams, Paginated } from "@/types"

export function mockDelay<T>(data: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms))
}

export function paginate<T>(items: T[], params?: ListParams): Paginated<T> {
  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 10
  const start = (page - 1) * pageSize
  return {
    items: items.slice(start, start + pageSize),
    total: items.length,
    page,
    pageSize,
  }
}

export function filterBySearch<T>(
  items: T[],
  search: string | undefined,
  fields: (item: T) => string[],
): T[] {
  if (!search?.trim()) return items
  const q = search.toLowerCase()
  return items.filter((item) =>
    fields(item).some((f) => f.toLowerCase().includes(q)),
  )
}
