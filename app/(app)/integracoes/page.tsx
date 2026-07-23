"use client"

import { PlugIcon } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { QueryError, EmptyState } from "@/components/query-state"
import { IntegrationStatusBadge } from "@/components/status-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useIntegrations } from "@/hooks/api/use-misc"
import { formatDateTime } from "@/lib/format"

export default function IntegrationsPage() {
  const query = useIntegrations()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Integrações" description="Conexões com sistemas externos usadas pelas automações." />

      {query.isError ? (
        <QueryError error={query.error} onRetry={() => query.refetch()} />
      ) : query.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : query.data.length === 0 ? (
        <EmptyState title="Nenhuma integração configurada" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {query.data.map((integration) => (
            <Card key={integration.id}>
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <PlugIcon className="size-5" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <CardTitle className="text-base">{integration.name}</CardTitle>
                    <span className="text-xs text-muted-foreground">{integration.category}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-sm text-muted-foreground text-pretty">{integration.description}</p>
                <div className="flex items-center justify-between">
                  <IntegrationStatusBadge status={integration.status} />
                  {integration.connectedAt ? (
                    <span className="text-xs text-muted-foreground">
                      desde {formatDateTime(integration.connectedAt)}
                    </span>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
