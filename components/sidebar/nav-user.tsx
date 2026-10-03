"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useSignOut } from "@/hooks/use-signout";
import { authClient } from "@/lib/auth-client";
import {
  BookOpen,
  EllipsisVertical,
  Home,
  LayoutDashboard,
  Loader2,
  LogOut,
} from "lucide-react";
import Link from "next/link";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();
  const { data: session, isPending } = authClient.useSession();
  const { signOut, isPending: isSigningOut } = useSignOut();

  const currentUser = {
    name: session?.user?.name || user.name,
    email: session?.user?.email || user.email,
    image:
      session?.user?.image ||
      user.avatar ||
      `https://avatar.vercel.sh/rauchg/${session?.user?.email || user.email}`,
  };

  const userInitials =
    currentUser.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    currentUser.email?.charAt(0).toUpperCase() ||
    "U";

  if (isPending) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex items-center gap-3 p-2">
            <div className="size-8 rounded-lg bg-muted animate-pulse" />
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="h-3.5 w-20 rounded bg-muted animate-pulse" />
              <div className="h-2.5 w-28 rounded bg-muted animate-pulse" />
            </div>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
            }
          >
            <Avatar className="size-8 rounded-lg">
              <AvatarImage src={currentUser.image} alt={currentUser.name} />
              <AvatarFallback className="rounded-lg text-xs font-semibold bg-primary/10 text-primary">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{currentUser.name}</span>
              <span className="truncate text-xs text-foreground/70">
                {currentUser.email}
              </span>
            </div>
            <EllipsisVertical className="ml-auto size-4" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="min-w-56"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            {/* User Profile Header */}
            <div className="flex items-center gap-2.5 px-2 py-2 text-left text-sm">
              <Avatar className="size-8 rounded-lg">
                <AvatarImage src={currentUser.image} alt={currentUser.name} />
                <AvatarFallback className="rounded-lg text-xs font-semibold bg-primary/10 text-primary">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{currentUser.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {currentUser.email}
                </span>
              </div>
            </div>

            <DropdownMenuSeparator />

            {/* Navigation links */}
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/">
                  <Home className="size-4" />
                  <span>Home Page</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin">
                  <LayoutDashboard className="size-4" />
                  <span>Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/courses">
                  <BookOpen className="size-4" />
                  <span>Courses</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Log out item with useSignOut handler */}
            <DropdownMenuItem
              variant="destructive"
              onClick={() => signOut()}
              disabled={isSigningOut}
            >
              {isSigningOut ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <LogOut className="size-4" />
              )}
              <span>{isSigningOut ? "Signing out..." : "Log out"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
