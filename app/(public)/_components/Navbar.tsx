"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ui/themeToggle";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import logoImage from "@/public/logo.png";
import {
  BookOpen,
  ChevronDown,
  LayoutDashboard,
  Loader2,
  LogOut,
  Settings,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function Navbar() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [isSigningOut, startSignOut] = useTransition();

  function signOut() {
    startSignOut(async () => {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/");
            router.refresh();
          },
        },
      });
    });
  }

  const userInitials =
    session?.user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "U";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-3 transition-opacity hover:opacity-90 group"
        >
          <Image
            src={logoImage}
            alt="ShikhonKhoni Logo"
            width={44}
            height={44}
            className="size-11 object-contain transition-transform group-hover:scale-105"
            priority
          />
          <span className="text-xl font-bold tracking-tight">
            <span className="text-blue-600 dark:text-blue-400 transition-colors">
              Shikhon
            </span>
            <span className="text-sky-500 dark:text-sky-300 transition-colors">
              Khoni
            </span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link
            href="/courses"
            className="transition-colors hover:text-foreground"
          >
            Courses
          </Link>
          <a
            href="#features"
            className="transition-colors hover:text-foreground"
          >
            Features
          </a>
          <a href="#why-us" className="transition-colors hover:text-foreground">
            Why Us
          </a>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {isPending ? (
            /* Loading skeleton */
            <div className="flex items-center gap-2">
              <div className="size-8 animate-pulse rounded-full bg-muted" />
              <div className="hidden sm:block h-4 w-20 animate-pulse rounded bg-muted" />
            </div>
          ) : session?.user ? (
            /* User Dropdown */
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                }
              >
                <Avatar className="size-8 ring-1 ring-border">
                  {session.user.image && (
                    <AvatarImage
                      src={session.user.image}
                      alt={session.user.name ?? "User"}
                    />
                  )}
                  <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:block max-w-[120px] truncate">
                  {session.user.name ?? session.user.email}
                </span>
                <ChevronDown className="size-3.5 text-muted-foreground hidden sm:block" />
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                {/* User info header — plain div avoids GroupLabel context requirement */}
                <div className="flex items-center gap-3 px-2 py-2.5">
                  <Avatar className="size-9 ring-1 ring-border">
                    {session.user.image && (
                      <AvatarImage
                        src={session.user.image}
                        alt={session.user.name ?? "User"}
                      />
                    )}
                    <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    {session.user.name && (
                      <span className="text-sm font-medium truncate">
                        {session.user.name}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground truncate">
                      {session.user.email}
                    </span>
                  </div>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <LayoutDashboard />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <BookOpen />
                    My Courses
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings />
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  variant="destructive"
                  onClick={signOut}
                  disabled={isSigningOut}
                >
                  {isSigningOut ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <LogOut />
                  )}
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* Guest Actions */
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "text-sm font-medium",
                )}
              >
                Sign in
              </Link>
              <Link
                href="/courses"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "text-sm font-medium shadow-sm",
                )}
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
