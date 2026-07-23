"use client"

import { Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { mockNotifications } from "@/data/mocks"
import { formatRelative } from "@/lib/format"
import { cn } from "@/lib/utils"

export function NotificationsMenu() {
  const notifications = mockNotifications
  const unread = notifications.filter((n) => !n.read).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="relative" aria-label="Notificações">
            <Bell />
            {unread > 0 ? (
              <span className="absolute right-1.5 top-1.5 flex size-2 rounded-full bg-destructive" />
            ) : null}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <p className="text-sm font-semibold">Notificações</p>
          {unread > 0 ? (
            <Badge variant="secondary">{unread} novas</Badge>
          ) : null}
        </div>
        <Separator />
        <ScrollArea className="max-h-80">
          <div className="flex flex-col">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "flex flex-col gap-1 px-4 py-3 text-sm border-b border-border last:border-b-0",
                  !n.read && "bg-accent/40",
                )}
              >
                <p className="font-medium leading-snug">{n.title}</p>
                <p className="text-muted-foreground leading-snug">{n.message}</p>
                <p className="text-xs text-muted-foreground">{formatRelative(n.createdAt)}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
