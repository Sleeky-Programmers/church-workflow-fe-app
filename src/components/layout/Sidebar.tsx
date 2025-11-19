"use client"

import {
  Activity,
  Calendar1,
  CalendarCheck2,
  ChartPie,
  Inbox,
  Layers,
  LogOut,
  MessagesSquare,
  NotepadTextDashed,
  Settings,
  Wallet,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const pages = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: ChartPie,
  },
  {
    title: "Membership",
    url: "/dashboard/membership",
    icon: Inbox,
  },
  {
    title: "Attendance",
    url: "/dashboard/attendance",
    icon: CalendarCheck2,
  },
  {
    title: "Departments/Units",
    url: "/dashboard/departments",
    icon: Layers,
  },
  {
    title: "Events & Reminders",
    url: "/dashboard/events",
    icon: Calendar1,
  },
  {
    title: "Communications",
    url: "/dashboard/communications",
    icon: MessagesSquare,
  },
  {
    title: "Requisitions",
    url: "/dashboard/requisitions",
    icon: NotepadTextDashed,
  },
  {
    title: "Finance",
    url: "/dashboard/finance",
    icon: Wallet,
  },
];

const footer = [
  {
    title: "Settings/Admin",
    url: "/dashboard/settings",
    icon: Settings,
  },
  {
    title: "Activity Log",
    url: "/dashboard/activity-log",
    icon: Activity,
  },
  {
    title: "Logout",
    url: "/auth/login",
    icon: LogOut,
  }
];

export function AppSidebar() {
  const pathname = usePathname();

  const isActive = (url: string) => {
    if (!url) {
      return false;
    }

    const normalize = (p: string | null | undefined) => {
      return p ? p.replace(/\/+$|^$/, "") : "";
    }

    const current = normalize(pathname);
    const target = normalize(url);
    return current === target;
  }

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <Image src="/assets/logo/horizontal/main.png" alt="Church Workflow" width={180} height={120} />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarGroup>
          <SidebarGroupLabel>Pages</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {pages.map((page) => (
                <SidebarMenuItem key={page.title}>
                  <SidebarMenuButton asChild isActive={isActive(page.url)}>
                    <Link href={page.url}>
                      <page.icon />
                      <span>{page.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarFooter>
          <SidebarMenu>
            {footer.map((page) => (
              <SidebarMenuItem key={page.title}>
                <SidebarMenuButton asChild isActive={isActive(page.url)}>
                  <Link href={page.url}>
                    <page.icon />
                    <span>{page.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
