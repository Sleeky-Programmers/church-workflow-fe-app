"use client"

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
import { Span } from "../ui/typography/Text";
import { SidebarData } from "@/lib/data";

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
              {SidebarData.pages.map((page) => (
                <SidebarMenuItem key={page.title}>
                  <SidebarMenuButton asChild isActive={isActive(page.url)}>
                    <Link href={page.url}>
                      <page.icon />
                      <Span text={page.title} />
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarFooter>
          <SidebarMenu>
            {SidebarData.footer.map((page) => (
              <SidebarMenuItem key={page.title}>
                <SidebarMenuButton asChild isActive={isActive(page.url)}>
                  <Link href={page.url}>
                    <page.icon />
                    <Span text={page.title} />
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
