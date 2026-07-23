import {
  CalendarClockIcon,
  HomeIcon,
  type LucideIcon,
  PlugIcon,
  ScrollTextIcon,
  SettingsIcon,
  UsersIcon,
  WorkflowIcon,
  ZapIcon,
} from "lucide-react"

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
}

export const navItems: NavItem[] = [
  { title: "Início", href: "/dashboard", icon: HomeIcon },
  { title: "Automações", href: "/automacoes", icon: WorkflowIcon },
  { title: "Execuções", href: "/execucoes", icon: ZapIcon },
  { title: "Agendamentos", href: "/agendamentos", icon: CalendarClockIcon },
  { title: "Logs", href: "/logs", icon: ScrollTextIcon },
  { title: "Integrações", href: "/integracoes", icon: PlugIcon },
  { title: "Usuários", href: "/usuarios", icon: UsersIcon },
  { title: "Configurações", href: "/configuracoes", icon: SettingsIcon },
]

export function getPageTitle(pathname: string): string {
  if (pathname.startsWith("/automacoes/nova")) return "Nova automação"
  if (pathname.startsWith("/automacoes/")) return "Detalhe da automação"
  const match = navItems.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/"),
  )
  return match?.title ?? "RPA Dashboard"
}
