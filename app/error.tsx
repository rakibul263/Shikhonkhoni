"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import logoImage from "@/public/logo.png";
import {
  AlertCircle,
  Home,
  LifeBuoy,
  RefreshCw,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Log the error to console for client-side logging
    console.error("Application Error:", error);
  }, [error]);

  const handleReset = () => {
    setIsRetrying(true);
    try {
      reset();
    } finally {
      setTimeout(() => setIsRetrying(false), 600);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-primary/10 selection:text-primary relative overflow-hidden">
      {/* Animated ambient background glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
      >
        <div className="relative left-[calc(50%-14rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-destructive/25 via-primary/15 to-transparent opacity-50 sm:left-[calc(50%-24rem)] sm:w-[72.1875rem] animate-pulse" />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 transform-gpu overflow-hidden blur-3xl"
      >
        <div className="relative left-[calc(50%+14rem)] aspect-[1155/678] w-[30rem] -translate-x-1/2 rotate-[-20deg] bg-gradient-to-tl from-primary/15 via-destructive/10 to-transparent opacity-40 sm:w-[60rem]" />
      </div>

      {/* Top Navbar */}
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
              <span className="absolute -top-1 -right-1 flex size-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive/60 opacity-75" />
                <span className="relative inline-flex rounded-full size-3 bg-destructive" />
              </span>
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

      {/* Main Error Presentation */}
      <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg w-full text-center flex flex-col items-center">
          {/* Badge */}
          <Badge
            variant="outline"
            className="px-4 py-1.5 text-xs sm:text-sm font-medium rounded-full border-destructive/30 bg-destructive/5 text-destructive backdrop-blur-sm gap-2 shadow-sm inline-flex items-center mb-8"
          >
            <AlertCircle className="size-3.5 text-destructive animate-pulse" />
            <span>Error 500 • Something Went Wrong</span>
          </Badge>

          {/* Animated Logo & Visual Icon Container */}
          <div className="relative mb-8 flex items-center justify-center select-none">
            {/* Glowing animated halo */}
            <div className="absolute size-32 rounded-full bg-destructive/15 blur-2xl animate-pulse" />
            <div className="absolute size-24 rounded-full bg-primary/20 blur-xl animate-ping opacity-30" />

            {/* Central Animated Logo Container */}
            <div className="relative size-24 sm:size-28 rounded-3xl bg-card border-2 border-destructive/30 flex items-center justify-center shadow-xl shadow-destructive/10 transition-transform duration-500 hover:scale-105">
              <Image
                src={logoImage}
                alt="ShikhonKhoni"
                width={64}
                height={64}
                className="size-16 object-contain animate-bounce"
                priority
              />

              {/* Floating alert pill */}
              <div className="absolute -bottom-2 -right-2 size-8 rounded-full bg-destructive text-destructive-foreground border-2 border-background flex items-center justify-center shadow-md animate-pulse">
                <AlertCircle className="size-4" />
              </div>
            </div>
          </div>

          {/* Headline & Description */}
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Oops! An error occurred
          </h1>
          <p className="mt-3 text-base text-muted-foreground leading-relaxed max-w-md">
            We encountered an unexpected problem while processing your request.
            Please try refreshing the page or head back to the homepage.
          </p>

          {/* Actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
            <Button
              size="lg"
              onClick={handleReset}
              disabled={isRetrying}
              className="gap-2 px-6 shadow-sm min-w-[140px]"
            >
              <RefreshCw
                className={`size-4 ${isRetrying ? "animate-spin" : ""}`}
              />
              <span>{isRetrying ? "Retrying..." : "Try Again"}</span>
            </Button>

            <Button size="lg" variant="outline" asChild className="gap-2 px-6">
              <Link href="/">
                <Home className="size-4" />
                <span>Go to Homepage</span>
              </Link>
            </Button>
          </div>

          {/* Helpful Support Footnote */}
          <div className="mt-12 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <LifeBuoy className="size-3.5 text-primary" />
            <span>Need assistance? Our support team is here to help.</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-5 text-center text-xs text-muted-foreground border-t border-border/40">
        <p>© {new Date().getFullYear()} ShikhonKhoni. All rights reserved.</p>
      </footer>
    </div>
  );
}
