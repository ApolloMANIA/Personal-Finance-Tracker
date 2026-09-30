import * as React from "react"
import { useEffect, useState, useContext } from "react"
import { AuthContext } from "@/context/AuthContext"
import { BASE_URL } from "@/utils/config"
import { Link, useLocation } from "react-router-dom"
import {
  IconArrowsExchange,
  IconBell,
  IconHome,
  IconReceipt2,
  IconWallet,
} from "@tabler/icons-react"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

const navMain = [
  { title: "Home", url: "/", icon: IconHome },
  { title: "Accounts", url: "/account", icon: IconWallet },
  { title: "Activity", url: "/transaction", icon: IconReceipt2 },
  { title: "Recurring", url: "/recurr", icon: IconArrowsExchange },
  { title: "Alerts", url: "/notifications", icon: IconBell },
]

interface UserProp {
  _id: string;
  name: string;
  email: string;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useContext(AuthContext);
  const [userData, setUserData] = useState<UserProp | null>(null);
  const location = useLocation();

  useEffect(() => {
    if (!user || !user.token) return;

    const fetchUser = async () => {
      try {
        const response = await fetch(`${BASE_URL}/account/getUser/${user.id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (!response.ok) throw new Error("Error fetching data");
        const body = await response.json();
        if (body.data) setUserData(body.data);
      } catch (error) {
        console.error("Error fetching account data:", error);
      }
    };

    fetchUser();
  }, [user]);

  const displayUser = userData
    ? { name: userData.name, email: userData.email, avatar: "" }
    : {
        name: user?.name || "User",
        email: user?.email || "",
        avatar: "",
      };

  return (
    <Sidebar collapsible="offcanvas" {...props} className="border-none bg-transparent">
      <SidebarHeader className="px-3 pt-4">
        <Link to="/" className="flex items-center gap-2.5 px-2">
          <span className="logo-mark flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-[0_8px_20px_rgba(0,82,255,0.35)]">
            FT
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-tight">Finance</p>
            <p className="text-[11px] text-muted-foreground">Built to track</p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 pt-4">
        <SidebarMenu className="gap-1">
          {navMain.map((item) => {
            const active = location.pathname === item.url;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  className={cn(
                    "h-11 rounded-xl px-3 text-[13px] font-medium transition-all",
                    active
                      ? "bg-white text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-white/70 hover:text-foreground"
                  )}
                >
                  <Link to={item.url}>
                    <item.icon className={cn("size-[18px]", active && "text-primary")} />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>

        <div className="mt-auto px-2 pb-2 pt-8">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#0052ff] to-[#00c2ff] p-4 text-white shadow-[0_12px_30px_rgba(0,82,255,0.28)]">
            <p className="text-sm font-semibold">Stay on budget</p>
            <p className="mt-1 text-xs text-white/80">
              Add recurring bills so due dates never sneak up.
            </p>
            <Link
              to="/recurr"
              className="mt-3 inline-flex h-8 items-center rounded-full bg-white/95 px-3 text-xs font-semibold text-[#0052ff] transition hover:bg-white"
            >
              Set recurring
            </Link>
          </div>
        </div>
      </SidebarContent>

      <SidebarFooter className="px-2 pb-3">
        <NavUser user={displayUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
