import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  FileEdit,
  Plus,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import {
  CourseCatalogItem,
  CoursesCatalogView,
} from "./_components/CoursesCatalogView";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  let courses: Array<{
    id: string;
    title: string;
    slug: string;
    smallDescription: string;
    fileKey: string;
    price: number;
    duration: number;
    level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    category: string;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    createAt: Date;
    chapters: Array<{
      id: string;
      lessons: Array<{
        id: string;
        isPublished: boolean;
        isFree: boolean;
      }>;
    }>;
  }> = [];

  let dbError: string | null = null;

  try {
    courses = await prisma.course.findMany({
      orderBy: { createAt: "desc" },
      include: {
        chapters: {
          select: {
            id: true,
            lessons: {
              select: { id: true, isPublished: true, isFree: true },
            },
          },
        },
      },
    });
  } catch (err) {
    console.error("Failed to fetch courses from database:", err);
    dbError = "Unable to connect to the database right now. Please refresh or try again in a few moments.";
  }

  const totalCourses = courses.length;
  const publishedCourses = courses.filter((c) => c.status === "PUBLISHED").length;
  const draftCourses = courses.filter((c) => c.status === "DRAFT").length;
  const totalHours = courses.reduce((acc, c) => acc + (c.duration || 0), 0);

  // Cast cleanly to CourseCatalogItem with total defensive fallback
  const catalogData: CourseCatalogItem[] = courses.map((c) => ({
    id: c.id,
    title: c.title || "Untitled Course",
    slug: c.slug || "",
    smallDescription: c.smallDescription || "",
    fileKey: c.fileKey || "",
    price: c.price || 0,
    duration: c.duration || 0,
    level: c.level || "BEGINNER",
    category: c.category || "General",
    status: c.status || "DRAFT",
    createAt: c.createAt ? new Date(c.createAt).toISOString() : new Date().toISOString(),
    chapters: (c.chapters || []).map((ch) => ({
      id: ch.id,
      lessons: (ch.lessons || []).map((l) => ({
        id: l.id,
        isPublished: Boolean(l.isPublished),
        isFree: Boolean(l.isFree),
      })),
    })),
  }));

  return (
    <div className="flex flex-col gap-8 w-full pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="inline-flex items-center gap-2 mb-2">
            <Badge
              variant="outline"
              className="px-3 py-1 text-xs font-medium rounded-full border-primary/20 bg-primary/5 text-primary gap-1.5"
            >
              <Sparkles className="size-3 text-primary animate-pulse" />
              Course Catalog
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Courses</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your course library, design chapter curricula, and publish educational content.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild size="default" className="gap-2 shadow-xs">
            <Link href="/admin/courses/create">
              <Plus className="size-4" />
              <span>Create Course</span>
            </Link>
          </Button>
        </div>
      </div>

      {dbError && (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-sm">
          {dbError}
        </div>
      )}

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4.5 flex flex-col gap-1.5 rounded-xl border bg-card/70 backdrop-blur-xs hover:border-primary/30 transition-colors">
          <span className="text-xs font-medium text-muted-foreground">Total Courses</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-bold tracking-tight">{totalCourses}</span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <BookOpen className="size-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4.5 flex flex-col gap-1.5 rounded-xl border bg-card/70 backdrop-blur-xs hover:border-emerald-500/30 transition-colors">
          <span className="text-xs font-medium text-muted-foreground">Published</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {publishedCourses}
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4.5 flex flex-col gap-1.5 rounded-xl border bg-card/70 backdrop-blur-xs hover:border-amber-500/30 transition-colors">
          <span className="text-xs font-medium text-muted-foreground">Drafts</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
              {draftCourses}
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <FileEdit className="size-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4.5 flex flex-col gap-1.5 rounded-xl border bg-card/70 backdrop-blur-xs hover:border-sky-500/30 transition-colors">
          <span className="text-xs font-medium text-muted-foreground">Total Duration</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-bold tracking-tight">{totalHours} hrs</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Clock className="size-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Interactive Catalog View with search, filter, and sorting */}
      <CoursesCatalogView initialCourses={catalogData} />
    </div>
  );
}
