import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import logoImage from "@/public/logo.png";
import {
  BookOpen,
  Compass,
  FileQuestion,
  Home,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-primary/10 selection:text-primary relative overflow-hidden">
      {/* Ambient background glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
      >
        <div className="relative left-[calc(50%-14rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary/25 via-sky-500/10 to-transparent opacity-50 sm:left-[calc(50%-24rem)] sm:w-[72.1875rem] animate-pulse" />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 transform-gpu overflow-hidden blur-3xl"
      >
        <div className="relative left-[calc(50%+14rem)] aspect-[1155/678] w-[30rem] -translate-x-1/2 rotate-[-20deg] bg-gradient-to-tl from-primary/15 via-blue-500/10 to-transparent opacity-40 sm:w-[60rem]" />
      </div>

      {/* Top Header */}
      <header className="w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-90 group"
          >
            <div className="relative">
              <Image
                src={logoImage}
                alt="ShikhonKhoni Logo"
                width={40}
                height={40}
                className="size-10 object-contain transition-transform group-hover:scale-105"
                priority
              />
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-blue-600 dark:text-blue-400">Shikhon</span>
              <span className="text-sky-500 dark:text-sky-300">Khoni</span>
            </span>
          </Link>

          <Button variant="ghost" size="sm" asChild>
            <Link href="/" className="gap-2 text-muted-foreground hover:text-foreground">
              <Home className="size-4" />
              <span>Back to Home</span>
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full text-center flex flex-col items-center">
          {/* Badge */}
          <Badge
            variant="outline"
            className="px-4 py-1.5 text-xs sm:text-sm font-medium rounded-full border-primary/20 bg-primary/5 text-primary backdrop-blur-sm gap-2 shadow-sm inline-flex items-center mb-6"
          >
            <Sparkles className="size-3.5 text-primary animate-pulse" />
            404 Error • Page Not Found
          </Badge>

          {/* Animated Logo + Big 404 Display */}
          <div className="relative my-4 select-none flex flex-col items-center justify-center">
            {/* Glowing animated backdrop */}
            <div className="absolute size-44 rounded-full bg-primary/15 blur-3xl animate-pulse" />

            <div className="relative flex items-center justify-center gap-4">
              <span className="text-7xl sm:text-9xl font-black tracking-tighter bg-gradient-to-b from-foreground via-foreground/75 to-foreground/20 bg-clip-text text-transparent">
                4
              </span>

              {/* Animated Floating Logo in center of 404 */}
              <div className="relative size-20 sm:size-28 rounded-3xl bg-card border-2 border-primary/30 flex items-center justify-center shadow-xl shadow-primary/10 transition-transform duration-500 hover:scale-105">
                <Image
                  src={logoImage}
                  alt="ShikhonKhoni"
                  width={64}
                  height={64}
                  className="size-14 sm:size-18 object-contain animate-bounce"
                  priority
                />
                <div className="absolute -bottom-2 -right-2 size-7 rounded-full bg-primary text-primary-foreground border-2 border-background flex items-center justify-center shadow-md animate-pulse">
                  <FileQuestion className="size-3.5" />
                </div>
              </div>

              <span className="text-7xl sm:text-9xl font-black tracking-tighter bg-gradient-to-b from-foreground via-foreground/75 to-foreground/20 bg-clip-text text-transparent">
                4
              </span>
            </div>
          </div>

          {/* Headline & Subtitle */}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-4">
            We couldn&apos;t find that page
          </h1>
          <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-lg leading-relaxed">
            The page you are looking for doesn&apos;t exist, has been removed,
            or is temporarily unavailable.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
            <Button size="lg" asChild className="gap-2 px-6 shadow-sm">
              <Link href="/">
                <Home className="size-4" />
                <span>Return to Home</span>
              </Link>
            </Button>

            <Button size="lg" variant="outline" asChild className="gap-2 px-6">
              <Link href="/courses">
                <BookOpen className="size-4" />
                <span>Browse Courses</span>
              </Link>
            </Button>

            <Button size="lg" variant="ghost" asChild className="gap-2 text-muted-foreground">
              <Link href="/admin/courses">
                <LayoutDashboard className="size-4" />
                <span>Admin Dashboard</span>
              </Link>
            </Button>
          </div>

          {/* Helpful Quick Links Cards in Clean English */}
          <div className="mt-14 w-full pt-10 border-t border-border/50">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-4">
              Helpful Destinations
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <Link
                href="/"
                className="group p-3.5 rounded-xl border border-border/60 bg-card hover:bg-accent hover:border-primary/30 transition-all flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                  <Compass className="size-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold group-hover:text-primary transition-colors">
                    Home
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Return to the main portal
                  </div>
                </div>
              </Link>

              <Link
                href="/courses"
                className="group p-3.5 rounded-xl border border-border/60 bg-card hover:bg-accent hover:border-sky-500/30 transition-all flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500 group-hover:scale-105 transition-transform">
                  <BookOpen className="size-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold group-hover:text-sky-500 transition-colors">
                    Explore Courses
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Browse all available lessons
                  </div>
                </div>
              </Link>

              <Link
                href="/admin/courses"
                className="group p-3.5 rounded-xl border border-border/60 bg-card hover:bg-accent hover:border-emerald-500/30 transition-all flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:scale-105 transition-transform">
                  <LayoutDashboard className="size-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold group-hover:text-emerald-500 transition-colors">
                    Course Management
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Admin courses dashboard
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-xs text-muted-foreground border-t border-border/40">
        <p>© {new Date().getFullYear()} ShikhonKhoni. All rights reserved.</p>
      </footer>
    </div>
  );
}
