import * as React from "react"
import { useEffect,useState,useContext } from "react"
import { AuthContext } from "@/context/AuthContext"
import { BASE_URL } from "@/utils/config"
import { Link } from "react-router-dom"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
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

const data = {
  user: {
    name: "user",
    email: "user@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: IconDashboard,
    },
    {
      title: "Financing",
      url: "/recurr",
      icon: IconChartBar,
    },
  ],
  // navSecondary: [
  //   {
  //     title: "Settings",
  //     url: "#",
  //     icon: IconSettings,
  //   },
  //   {
  //     title: "Get Help",
  //     url: "#",
  //     icon: IconHelp,
  //   },
    
  // ],
  // documents: [
  //   {
  //     name: "Your Data",
  //     url: "#",
  //     icon: IconDatabase,
  //   },
  //   {
  //     name: "Reports",
  //     url: "#",
  //     icon: IconReport,
  //   },
  // ],
}
interface UserProp{
  _id:string;
  name:string;
  email:string;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  
  const { user } = useContext(AuthContext);
  const [userData, setUserData] = useState<UserProp|null>(null);

  useEffect(() => {
    if (!user || !user.token) return;
  
    const fetchUser = async () => {
      try {
        const response = await fetch(`${BASE_URL}/account/getUser/${user.id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
  
        if (!response.ok) throw new Error("Error fetching data");
  
        let body = await response.json();
        let responseData:UserProp = body.data;
  
        if (!responseData ) {
          console.warn("No user found in response");
          return;
        }

        setUserData(responseData);
      } catch (error) {
        console.error("Error fetching account data:", error);
      }
    };
  
    fetchUser();
    const intervalId = setInterval(fetchUser, 10000);
    return () => {
      clearInterval(intervalId);
    };
  }, [user]);
  useEffect(() => {
    // console.log("Updated userData:", userData);
  }, [userData]);


  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Finance Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavDocuments items={data.documents} /> */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData?{name:userData.name,email:userData.email,avatar:"/avatars/shadcn.jpg"}: { name: "Guest", email: "guest@example.com", avatar: "/avatars/shadcn.jpg"}} />
      </SidebarFooter>
    </Sidebar>
  )
}
