import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/themeToggle";
import { cn } from "@/lib/utils";
import logoImage from "@/public/logo.png";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-background text-foreground antialiased selection:bg-primary/10 selection:text-primary overflow-x-hidden">
      {/* Ambient background glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex transform-gpu justify-center overflow-hidden blur-3xl"
      >
        <div className="aspect-[1100/400] w-[68rem] flex-none bg-gradient-to-r from-blue-600/15 via-sky-500/10 to-indigo-500/15 opacity-40 dark:opacity-30" />
      </div>

      {/* Top Navbar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-full px-3.5 py-1.5 border border-border/50 bg-background/50 backdrop-blur-sm shadow-xs transition-all hover:bg-muted group",
          )}
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
          <span>Back to Home</span>
        </Link>

        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-8">
        <div className="w-full max-w-md mx-auto flex flex-col items-center">
          {/* Brand header */}
          <Link
            href="/"
            className="flex items-center gap-3 mb-6 transition-transform hover:scale-[1.02] group"
          >
            <Image
              src={logoImage}
              alt="ShikhonKhoni Logo"
              width={42}
              height={42}
              className="size-10 object-contain transition-transform group-hover:scale-105"
              priority
            />
            <span className="text-2xl font-bold tracking-tight">
              <span className="text-blue-600 dark:text-blue-400 transition-colors">
                Shikhon
              </span>
              <span className="text-sky-500 dark:text-sky-300 transition-colors">
                Khoni
              </span>
            </span>
          </Link>

          {/* Form Card Container */}
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md mx-auto px-4 py-6 text-center text-xs text-muted-foreground space-y-2">
        <div className="flex items-center justify-center gap-1.5 text-muted-foreground/80 font-medium text-[11px]">
          <ShieldCheck className="size-3.5 text-emerald-500" />
          <span>Encrypted & secure authentication</span>
        </div>
        <p className="leading-relaxed text-[11px]">
          By continuing, you agree to our{" "}
          <Link
            href="/"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            Privacy Policy
          </Link>
          .
        </p>
        <p className="text-[10px] text-muted-foreground/60">
          © {new Date().getFullYear()} ShikhonKhoni. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
