"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { CirclePlusIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: React.ReactNode;
    isActive?: boolean;
  }[];
}) {
  const pathname = usePathname();

  // Find Dashboard item to place it at the very top
  const dashboardItem =
    items.find((item) => item.title.toLowerCase() === "dashboard") || items[0];
  const otherItems = items.filter((item) => item !== dashboardItem);

  // Exact route checks
  const isQuickCreateActive = pathname === "/admin/courses/create";
  const isDashboardActive =
    dashboardItem?.isActive ??
    (!isQuickCreateActive &&
      (pathname === "/admin" ||
        pathname === "/admin/dashboard" ||
        pathname === dashboardItem?.url));

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {/* 1. Dashboard at the top */}
          {dashboardItem && (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip={dashboardItem.title}
                isActive={isDashboardActive}
                className={
                  isDashboardActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs hover:bg-primary/90 hover:text-primary-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }
              >
                <Link
                  href={
                    dashboardItem.url === "#" ? "/admin" : dashboardItem.url
                  }
                >
                  {dashboardItem.icon}
                  <span>{dashboardItem.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          {/* 2. Quick Create under Dashboard */}
          <SidebarMenuItem className="my-0.5">
            <SidebarMenuButton
              asChild
              tooltip="Quick Create"
              isActive={isQuickCreateActive}
              className={
                isQuickCreateActive
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs hover:bg-primary/90 hover:text-primary-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }
            >
              <Link href="/admin/courses/create" className="flex">
                <CirclePlusIcon />
                <span>Quick Create</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* 3. Other menu items */}
          {otherItems.map((item) => {
            const isItemActive =
              item.isActive ??
              (!isQuickCreateActive &&
                item.url !== "#" &&
                (pathname === item.url ||
                  pathname?.startsWith(item.url + "/")));

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isItemActive}
                  className={
                    isItemActive
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs hover:bg-primary/90 hover:text-primary-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  }
                >
                  <Link href={item.url}>
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
