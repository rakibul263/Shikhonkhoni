"use client";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import logoImage from "@/public/logo.png";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Laptop,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "./_components/Navbar";

export default function Home() {
  const { data: session } = authClient.useSession();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-primary/10 selection:text-primary">
      <Navbar />

      {/* Main Hero & Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32">
          {/* Subtle Ambient Background Gradients */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          >
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary/20 via-primary/5 to-transparent opacity-40 sm:left-[calc(50%-20rem)] sm:w-[72.1875rem]" />
          </div>

          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
              {/* Badge */}
              <Badge
                variant="outline"
                className="px-4 py-1.5 text-xs sm:text-sm font-medium rounded-full border-primary/20 bg-primary/5 text-primary backdrop-blur-sm gap-2 shadow-sm inline-flex items-center"
              >
                <Sparkles className="size-3.5 text-primary animate-pulse" />
                The Future of Online Education.
              </Badge>

              {/* Headline */}
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl text-balance">
                Elevate Your{" "}
                <span className="bg-gradient-to-r from-primary via-primary/90 to-primary/60 bg-clip-text text-transparent">
                  Learning Experience.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="max-w-2xl text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed text-balance">
                Discover a new way to learn with our modern, interactive
                learning management system. Access high-quality courses anytime,
                anywhere.
              </p>

              {/* Call to Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full sm:w-auto">
                <Link
                  href="/courses"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "w-full sm:w-auto h-12 px-7 text-base font-semibold shadow-lg shadow-primary/15 gap-2 group transition-all",
                  )}
                >
                  Explore Courses
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>

                {session?.user ? (
                  <Link
                    href="/courses"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "w-full sm:w-auto h-12 px-7 text-base font-semibold transition-colors",
                    )}
                  >
                    My Learning
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "w-full sm:w-auto h-12 px-7 text-base font-semibold transition-colors",
                    )}
                  >
                    Sign in
                  </Link>
                )}
              </div>

            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section id="features" className="py-20 bg-muted/30 border-y border-border/40">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
              <Badge variant="outline" className="text-xs uppercase tracking-wider font-semibold">
                Why ShikhonKhoni
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Designed for ambitious minds
              </h2>
              <p className="text-muted-foreground text-base">
                Everything you need to master new concepts, track your progress, and excel in your learning journey.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <Card className="relative overflow-hidden border-border/60 hover:border-primary/40 transition-all hover:shadow-md">
                <CardHeader className="space-y-3">
                  <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <BookOpen className="size-6" />
                  </div>
                  <CardTitle className="text-xl">Interactive Courses</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    Learn by doing with comprehensive curriculum, interactive quizzes, and practical assignments built by industry pros.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2 text-xs text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-primary" />
                  <span>Real-time code & concept evaluations</span>
                </CardContent>
              </Card>

              {/* Feature 2 */}
              <Card className="relative overflow-hidden border-border/60 hover:border-primary/40 transition-all hover:shadow-md">
                <CardHeader className="space-y-3">
                  <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Laptop className="size-6" />
                  </div>
                  <CardTitle className="text-xl">Learn Anywhere, Anytime</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    Seamless cross-device experience. Seamlessly resume lectures on your desktop, tablet, or phone without missing a beat.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2 text-xs text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-primary" />
                  <span>Offline bookmarks & cloud-synced notes</span>
                </CardContent>
              </Card>

              {/* Feature 3 */}
              <Card className="relative overflow-hidden border-border/60 hover:border-primary/40 transition-all hover:shadow-md">
                <CardHeader className="space-y-3">
                  <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Award className="size-6" />
                  </div>
                  <CardTitle className="text-xl">Recognized Certification</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    Earn verified certificates to prove your proficiency and share them directly to LinkedIn, portfolios, and resumes.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2 text-xs text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-primary" />
                  <span>Shareable digital credentials</span>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/20 py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Image
              src={logoImage}
              alt="Logo"
              width={28}
              height={28}
              className="size-7 object-contain"
            />
            <span className="font-bold text-sm tracking-tight">
              <span className="text-blue-600 dark:text-blue-400">Shikhon</span>
              <span className="text-sky-500 dark:text-sky-300">Khoni</span>
            </span>
          </div>

          <p className="text-xs text-muted-foreground text-center sm:text-left">
            © {new Date().getFullYear()} ShikhonKhoni. All rights reserved.
          </p>

          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
