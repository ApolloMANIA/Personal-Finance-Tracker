import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ReactNode } from "react"

interface Props {
  children: ReactNode;
  pageTitle: string
};

export default function Layout({ children, pageTitle }: Props) {
  return (
    <SidebarProvider className="min-h-svh bg-background p-2 md:p-3">
      <AppSidebar variant="inset" />
      <SidebarInset className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm md:rounded-3xl">
        <SiteHeader pageTitle={pageTitle} />
        <div className="flex flex-1 flex-col overflow-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
