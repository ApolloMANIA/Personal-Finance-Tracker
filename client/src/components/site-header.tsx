import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { IconBell, IconPlus, IconSettings } from "@tabler/icons-react"

interface Props {
  pageTitle: string;
}

export function SiteHeader({ pageTitle }: Props) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 px-4 md:h-16 md:px-6">
      <SidebarTrigger className="-ml-1 rounded-full" />
      <h1 className="text-lg font-semibold tracking-tight md:text-xl">{pageTitle}</h1>

      <div className="ml-auto flex items-center gap-1.5 md:gap-2">
        <Button variant="ghost" size="icon" className="hidden rounded-full sm:flex" asChild>
          <Link to="/notifications" aria-label="Notifications">
            <IconBell className="size-4" />
          </Link>
        </Button>
        <Button variant="ghost" size="icon" className="hidden rounded-full sm:flex" asChild>
          <Link to="/account" aria-label="Settings">
            <IconSettings className="size-4" />
          </Link>
        </Button>
        <Button asChild className="h-9 rounded-full px-4 text-sm font-semibold shadow-[0_8px_20px_rgba(0,82,255,0.25)]">
          <Link to="/transaction">
            <IconPlus className="size-4" />
            <span className="hidden sm:inline">Add</span>
          </Link>
        </Button>
      </div>
    </header>
  )
}
