import type {
  Automation,
  ChartPeriod,
  ChartPoint,
  DashboardMetrics,
  Execution,
  Integration,
  LogEntry,
  Notification,
  Schedule,
  User,
} from "@/types"

// ---------------------------------------------------------------------------
// In-memory mock dataset. Used when NEXT_PUBLIC_USE_MOCKS !== "false".
// Data is intentionally realistic (pt-BR) so the UI looks production-ready.
// ---------------------------------------------------------------------------

const now = Date.now()
const iso = (offsetMs: number) => new Date(now - offsetMs).toISOString()
const MIN = 60_000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

export const mockUser: User = {
  id: "1",
  username: "admin",
  name: "Ana Ribeiro",
  email: "ana.ribeiro@empresa.com.br",
  role: "admin",
  active: true,
  createdAt: iso(120 * DAY),
}

export const mockAutomations: Automation[] = [
  {
    id: "1",
    name: "Conciliação bancária diária",
    description: "Concilia extratos bancários com o ERP e gera relatório de divergências.",
    status: "active",
    triggerType: "schedule",
    category: "Financeiro",
    owner: "Ana Ribeiro",
    steps: [
      { id: "1", name: "Baixar extrato", type: "download" },
      { id: "2", name: "Ler ERP", type: "integration" },
      { id: "3", name: "Comparar registros", type: "logic" },
      { id: "4", name: "Gerar relatório", type: "report" },
    ],
    schedule: "Todos os dias às 06:00",
    successRate: 98.2,
    lastRunAt: iso(2 * HOUR),
    totalRuns: 412,
    createdAt: iso(90 * DAY),
    updatedAt: iso(2 * HOUR),
  },
  {
    id: "2",
    name: "Emissão de notas fiscais",
    description: "Emite NF-e a partir dos pedidos aprovados no sistema de vendas.",
    status: "active",
    triggerType: "event",
    category: "Fiscal",
    owner: "Carlos Souza",
    steps: [
      { id: "1", name: "Ler pedidos", type: "integration" },
      { id: "2", name: "Validar dados", type: "logic" },
      { id: "3", name: "Emitir NF-e", type: "integration" },
    ],
    successRate: 95.7,
    lastRunAt: iso(35 * MIN),
    totalRuns: 1289,
    createdAt: iso(140 * DAY),
    updatedAt: iso(35 * MIN),
  },
  {
    id: "3",
    name: "Onboarding de colaboradores",
    description: "Cria acessos, e-mail corporativo e cadastro no RH para novos contratados.",
    status: "paused",
    triggerType: "manual",
    category: "RH",
    owner: "Marina Alves",
    steps: [
      { id: "1", name: "Criar usuário AD", type: "integration" },
      { id: "2", name: "Criar e-mail", type: "integration" },
      { id: "3", name: "Cadastrar no RH", type: "integration" },
    ],
    successRate: 99.1,
    lastRunAt: iso(3 * DAY),
    totalRuns: 87,
    createdAt: iso(60 * DAY),
    updatedAt: iso(3 * DAY),
  },
  {
    id: "4",
    name: "Extração de relatórios de vendas",
    description: "Extrai relatórios do portal e envia por e-mail para a diretoria.",
    status: "error",
    triggerType: "schedule",
    category: "Vendas",
    owner: "Carlos Souza",
    steps: [
      { id: "1", name: "Acessar portal", type: "web" },
      { id: "2", name: "Baixar relatório", type: "download" },
      { id: "3", name: "Enviar e-mail", type: "email" },
    ],
    schedule: "Segundas às 08:00",
    successRate: 82.4,
    lastRunAt: iso(20 * HOUR),
    totalRuns: 56,
    createdAt: iso(45 * DAY),
    updatedAt: iso(20 * HOUR),
  },
  {
    id: "5",
    name: "Atualização de estoque",
    description: "Sincroniza níveis de estoque entre o e-commerce e o ERP.",
    status: "active",
    triggerType: "schedule",
    category: "Logística",
    owner: "Pedro Lima",
    steps: [
      { id: "1", name: "Ler e-commerce", type: "integration" },
      { id: "2", name: "Atualizar ERP", type: "integration" },
    ],
    schedule: "A cada 2 horas",
    successRate: 97.0,
    lastRunAt: iso(50 * MIN),
    totalRuns: 2043,
    createdAt: iso(200 * DAY),
    updatedAt: iso(50 * MIN),
  },
  {
    id: "6",
    name: "Cobrança de inadimplentes",
    description: "Identifica boletos vencidos e dispara mensagens de cobrança.",
    status: "draft",
    triggerType: "schedule",
    category: "Financeiro",
    owner: "Ana Ribeiro",
    steps: [{ id: "1", name: "Consultar boletos", type: "integration" }],
    successRate: 0,
    totalRuns: 0,
    createdAt: iso(5 * DAY),
    updatedAt: iso(5 * DAY),
  },
]

const executionStatuses: Execution["status"][] = [
  "completed",
  "completed",
  "completed",
  "running",
  "error",
  "canceled",
  "queued",
]

export const mockExecutions: Execution[] = Array.from({ length: 48 }).map((_, i) => {
  const automation = mockAutomations[i % mockAutomations.length]
  const status = executionStatuses[i % executionStatuses.length]
  const startedAt = iso(i * 47 * MIN)
  const running = status === "running" || status === "queued"
  const duration = running ? undefined : 30 + ((i * 17) % 600)
  return {
    id: String(1000 + i),
    automationId: automation.id,
    automationName: automation.name,
    status,
    startedAt,
    finishedAt: running ? undefined : iso(i * 47 * MIN - (duration ?? 0) * 1000),
    durationSeconds: duration,
    progress: status === "running" ? 30 + ((i * 13) % 60) : status === "queued" ? 0 : 100,
    triggeredBy: i % 3 === 0 ? "Agendamento" : i % 3 === 1 ? "Ana Ribeiro" : "Webhook",
    errorMessage: status === "error" ? "Timeout ao acessar o portal externo." : undefined,
  }
})

export function buildMetrics(): DashboardMetrics {
  return {
    totalAutomations: mockAutomations.length,
    activeAutomations: mockAutomations.filter((a) => a.status === "active").length,
    executionsToday: 37,
    executionsWithError: mockExecutions.filter((e) => e.status === "error").length,
    successRate: 94.6,
    hoursSaved: 1284,
  }
}

export function buildChart(period: ChartPeriod): ChartPoint[] {
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90
  return Array.from({ length: days }).map((_, i) => {
    const date = new Date(now - (days - 1 - i) * DAY)
    const base = 20 + Math.round(Math.sin(i / 3) * 8) + (i % 5)
    return {
      date: date.toISOString().slice(0, 10),
      completed: Math.max(4, base + (i % 7)),
      error: Math.max(0, Math.round((i % 4) + Math.cos(i / 2) * 2)),
    }
  })
}

const logLevels: LogEntry["level"][] = ["info", "info", "warning", "error", "debug"]

export const mockLogs: LogEntry[] = Array.from({ length: 60 }).map((_, i) => {
  const automation = mockAutomations[i % mockAutomations.length]
  const level = logLevels[i % logLevels.length]
  return {
    id: String(5000 + i),
    timestamp: iso(i * 11 * MIN),
    level,
    automationId: automation.id,
    automationName: automation.name,
    executionId: String(1000 + (i % 48)),
    message:
      level === "error"
        ? `Falha na etapa "${automation.steps[0]?.name ?? "início"}": conexão recusada.`
        : level === "warning"
          ? "Tempo de resposta acima do esperado (4.2s)."
          : `Execução da etapa "${automation.steps[0]?.name ?? "início"}" concluída.`,
    source: automation.category.toLowerCase(),
  }
})

export const mockSchedules: Schedule[] = [
  {
    id: "1",
    automationId: "1",
    automationName: "Conciliação bancária diária",
    cron: "0 6 * * *",
    humanReadable: "Todos os dias às 06:00",
    timezone: "America/Sao_Paulo",
    status: "active",
    nextRunAt: iso(-4 * HOUR),
    lastRunAt: iso(20 * HOUR),
  },
  {
    id: "2",
    automationId: "5",
    automationName: "Atualização de estoque",
    cron: "0 */2 * * *",
    humanReadable: "A cada 2 horas",
    timezone: "America/Sao_Paulo",
    status: "active",
    nextRunAt: iso(-70 * MIN),
    lastRunAt: iso(50 * MIN),
  },
  {
    id: "3",
    automationId: "4",
    automationName: "Extração de relatórios de vendas",
    cron: "0 8 * * 1",
    humanReadable: "Segundas às 08:00",
    timezone: "America/Sao_Paulo",
    status: "paused",
    nextRunAt: iso(-3 * DAY),
    lastRunAt: iso(4 * DAY),
  },
]

export const mockIntegrations: Integration[] = [
  {
    id: "1",
    name: "SAP ERP",
    category: "ERP",
    description: "Integração com o sistema de gestão empresarial.",
    status: "connected",
    connectedAt: iso(90 * DAY),
  },
  {
    id: "2",
    name: "Gmail Corporativo",
    category: "E-mail",
    description: "Envio automático de e-mails e relatórios.",
    status: "connected",
    connectedAt: iso(60 * DAY),
  },
  {
    id: "3",
    name: "Banco do Brasil API",
    category: "Financeiro",
    description: "Consulta de extratos e conciliação bancária.",
    status: "connected",
    connectedAt: iso(30 * DAY),
  },
  {
    id: "4",
    name: "WhatsApp Business",
    category: "Mensageria",
    description: "Disparo de mensagens de cobrança e notificações.",
    status: "disconnected",
  },
  {
    id: "5",
    name: "Portal SEFAZ",
    category: "Fiscal",
    description: "Emissão e consulta de notas fiscais eletrônicas.",
    status: "error",
    connectedAt: iso(15 * DAY),
  },
]

export const mockUsers: User[] = [
  mockUser,
  {
    id: "2",
    username: "carlos",
    name: "Carlos Souza",
    email: "carlos.souza@empresa.com.br",
    role: "operator",
    active: true,
    createdAt: iso(80 * DAY),
  },
  {
    id: "3",
    username: "marina",
    name: "Marina Alves",
    email: "marina.alves@empresa.com.br",
    role: "operator",
    active: true,
    createdAt: iso(70 * DAY),
  },
  {
    id: "4",
    username: "pedro",
    name: "Pedro Lima",
    email: "pedro.lima@empresa.com.br",
    role: "viewer",
    active: false,
    createdAt: iso(40 * DAY),
  },
]

export const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Automação com erro",
    message: "\"Emissão de notas fiscais\" falhou na última execução.",
    createdAt: iso(15 * MIN),
    read: false,
  },
  {
    id: "2",
    title: "Execução concluída",
    message: "\"Conciliação bancária diária\" foi concluída com sucesso.",
    createdAt: iso(2 * HOUR),
    read: false,
  },
  {
    id: "3",
    title: "Novo agendamento criado",
    message: "Um agendamento foi criado para \"Portal SEFAZ\".",
    createdAt: iso(1 * DAY),
    read: true,
  },
  {
    id: "4",
    title: "Integração desconectada",
    message: "A integração \"Portal SEFAZ\" precisa de atenção.",
    createdAt: iso(3 * DAY),
    read: true,
  },
]
