import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/db";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  FileEdit,
  FolderGit2,
  Layers,
  Lock,
  PlayCircle,
  Tag,
  Video,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseActionsMenu } from "../_components/CourseActionsMenu";

interface CourseDetailsPageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function CourseDetailsPage({
  params,
}: CourseDetailsPageProps) {
  const { courseId } = await params;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      chapters: {
        orderBy: { position: "asc" },
        include: {
          lessons: {
            orderBy: { position: "asc" },
          },
        },
      },
      User: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  const totalLessons = course.chapters.reduce(
    (acc, ch) => acc + ch.lessons.length,
    0,
  );
  const publishedLessons = course.chapters.reduce(
    (acc, ch) => acc + ch.lessons.filter((l) => l.isPublished).length,
    0,
  );
  const freeLessons = course.chapters.reduce(
    (acc, ch) => acc + ch.lessons.filter((l) => l.isFree).length,
    0,
  );

  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto pb-16">
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild className="gap-2">
            <Link href="/admin/courses">
              <ArrowLeft className="size-4" />
              <span>All Courses</span>
            </Link>
          </Button>

          <div className="h-4 w-px bg-border hidden sm:block" />

          <Badge
            variant={
              course.status === "PUBLISHED"
                ? "default"
                : course.status === "DRAFT"
                  ? "secondary"
                  : "outline"
            }
            className="capitalize text-xs font-semibold"
          >
            {course.status.toLowerCase()}
          </Badge>

          <Badge variant="outline" className="text-xs">
            {course.category}
          </Badge>

          <span className="text-xs text-muted-foreground capitalize hidden md:inline">
            • {course.level.toLowerCase()} level
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="gap-1.5">
            <Link href={`/admin/courses/${course.id}/structure`}>
              <FolderGit2 className="size-4 text-primary" />
              <span>Curriculum (DnD)</span>
            </Link>
          </Button>

          <Button size="sm" asChild className="gap-1.5">
            <Link href={`/admin/courses/${course.id}/edit`}>
              <FileEdit className="size-4" />
              <span>Edit Details</span>
            </Link>
          </Button>

          <CourseActionsMenu
            courseId={course.id}
            courseTitle={course.title}
          />
        </div>
      </div>

      {/* Hero Overview Header */}
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          {course.title}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
          {course.smallDescription || "No short description provided for this course."}
        </p>
      </div>

      {/* Key Metric Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 flex flex-col gap-1 rounded-xl bg-card/70 border">
          <span className="text-xs text-muted-foreground">Course Fee</span>
          <div className="text-xl sm:text-2xl font-bold">
            {course.price === 0 ? "Free" : `৳ ${course.price.toLocaleString()}`}
          </div>
        </Card>

        <Card className="p-4 flex flex-col gap-1 rounded-xl bg-card/70 border">
          <span className="text-xs text-muted-foreground">Total Duration</span>
          <div className="text-xl sm:text-2xl font-bold flex items-center gap-1.5">
            <Clock className="size-5 text-sky-500" />
            <span>{course.duration} hrs</span>
          </div>
        </Card>

        <Card className="p-4 flex flex-col gap-1 rounded-xl bg-card/70 border">
          <span className="text-xs text-muted-foreground">Total Chapters</span>
          <div className="text-xl sm:text-2xl font-bold flex items-center gap-1.5">
            <Layers className="size-5 text-primary" />
            <span>{course.chapters.length}</span>
          </div>
        </Card>

        <Card className="p-4 flex flex-col gap-1 rounded-xl bg-card/70 border">
          <span className="text-xs text-muted-foreground">Total Lessons</span>
          <div className="text-xl sm:text-2xl font-bold flex items-center gap-1.5">
            <PlayCircle className="size-5 text-emerald-500" />
            <span>{totalLessons}</span>
          </div>
        </Card>
      </div>

      {/* Main Content Layout (2 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (2 cols wide): Description and Curriculum Details */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Detailed Course Description */}
          <Card className="rounded-xl border bg-card/70">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <BookOpen className="size-5 text-primary" />
                <span>Full Course Description</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {course.description ? (
                <div
                  className="prose dark:prose-invert max-w-none text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: course.description }}
                />
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No detailed description has been added yet.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Curriculum Structure Overview */}
          <Card className="rounded-xl border bg-card/70">
            <CardHeader className="border-b pb-4 flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Layers className="size-5 text-primary" />
                  <span>Curriculum & Lessons ({course.chapters.length} Chapters)</span>
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  Published: {publishedLessons}/{totalLessons} • Free Preview: {freeLessons}
                </CardDescription>
              </div>

              <Button variant="outline" size="sm" asChild className="gap-1.5">
                <Link href={`/admin/courses/${course.id}/structure`}>
                  <FolderGit2 className="size-3.5" />
                  <span>Structure (DnD)</span>
                </Link>
              </Button>
            </CardHeader>

            <CardContent className="p-6">
              {course.chapters.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-xl">
                  <p className="text-sm text-muted-foreground mb-4">
                    No chapters have been added to this course yet.
                  </p>
                  <Button asChild size="sm">
                    <Link href={`/admin/courses/${course.id}/structure`}>
                      <FolderGit2 className="size-4" />
                      <span>Build Chapters & Lessons</span>
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {course.chapters.map((chapter, chIdx) => (
                    <div
                      key={chapter.id}
                      className="border rounded-xl p-4 bg-muted/20 flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                            {chIdx + 1}
                          </span>
                          <h4 className="text-sm font-bold text-foreground">
                            {chapter.title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={chapter.isPublished ? "default" : "outline"}
                            className="text-[11px]"
                          >
                            {chapter.isPublished ? "Published" : "Draft"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {chapter.lessons.length} {chapter.lessons.length === 1 ? "lesson" : "lessons"}
                          </span>
                        </div>
                      </div>

                      {chapter.description && (
                        <p className="text-xs text-muted-foreground pl-8">
                          {chapter.description}
                        </p>
                      )}

                      {/* Lessons inside chapter */}
                      <div className="flex flex-col gap-1.5 pl-8 mt-1">
                        {chapter.lessons.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic">
                            No lessons added in this chapter.
                          </p>
                        ) : (
                          chapter.lessons.map((lesson, lIdx) => (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-card border border-border/50"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-muted-foreground text-[11px]">
                                  {chIdx + 1}.{lIdx + 1}
                                </span>
                                <span className="font-medium truncate">
                                  {lesson.title}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {lesson.isFree ? (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                  >
                                    Free Preview
                                  </Badge>
                                ) : (
                                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                    <Lock className="size-3" />
                                    Locked
                                  </span>
                                )}

                                {lesson.videoUrl && (
                                  <span className="flex items-center gap-1 text-[11px] text-sky-600 dark:text-sky-400">
                                    <Video className="size-3" />
                                    Video
                                  </span>
                                )}

                                <Badge
                                  variant={lesson.isPublished ? "secondary" : "outline"}
                                  className="text-[10px]"
                                >
                                  {lesson.isPublished ? "Published" : "Draft"}
                                </Badge>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar: Thumbnail Preview & Meta Info */}
        <div className="flex flex-col gap-6">
          {/* Thumbnail Card */}
          <Card className="rounded-xl border bg-card/70 overflow-hidden">
            <div className="relative aspect-video w-full bg-muted/40">
              {course.fileKey ? (
                <Image
                  src={course.fileKey}
                  alt={course.title}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-muted-foreground">
                  <BookOpen className="size-12 stroke-[1.5]" />
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Course Thumbnail</span>
                <Button variant="ghost" size="xs" asChild>
                  <Link href={`/admin/courses/${course.id}/edit`}>
                    Change Thumbnail
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Metadata Card */}
          <Card className="rounded-xl border bg-card/70">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Tag className="size-4 text-primary" />
                <span>Course Metadata</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Course ID</span>
                <span className="font-mono text-[11px] text-foreground truncate max-w-[150px]">
                  {course.id}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Slug</span>
                <span className="font-mono text-[11px] text-foreground truncate max-w-[150px]">
                  {course.slug}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Category</span>
                <span className="font-semibold text-foreground">
                  {course.category}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Level</span>
                <span className="font-semibold text-foreground capitalize">
                  {course.level.toLowerCase()}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Created On</span>
                <span className="text-foreground">
                  {new Date(course.createAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              {course.User && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-muted-foreground">Instructor</span>
                  <span className="font-medium text-foreground">
                    {course.User.name || course.User.email}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
