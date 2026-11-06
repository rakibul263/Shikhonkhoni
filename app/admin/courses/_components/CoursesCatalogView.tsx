"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Clock,
  FileEdit,
  Filter,
  FolderGit2,
  Layers,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CourseActionsMenu } from "./CourseActionsMenu";

export interface CourseCatalogItem {
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
  createAt: string;
  chapters: {
    id: string;
    lessons: {
      id: string;
      isPublished: boolean;
      isFree: boolean;
    }[];
  }[];
}

interface CoursesCatalogViewProps {
  initialCourses: CourseCatalogItem[];
}

export function CoursesCatalogView({
  initialCourses = [],
}: CoursesCatalogViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("NEWEST");

  // Calculate status counts
  const publishedCount = useMemo(
    () => initialCourses.filter((c) => c.status === "PUBLISHED").length,
    [initialCourses],
  );
  const draftCount = useMemo(
    () => initialCourses.filter((c) => c.status === "DRAFT").length,
    [initialCourses],
  );
  const archivedCount = useMemo(
    () => initialCourses.filter((c) => c.status === "ARCHIVED").length,
    [initialCourses],
  );

  // Filtered and sorted courses
  const filteredCourses = useMemo(() => {
    return initialCourses
      .filter((course) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = (course.title || "").toLowerCase().includes(q);
          const matchesCategory = (course.category || "").toLowerCase().includes(q);
          const matchesSlug = (course.slug || "").toLowerCase().includes(q);
          if (!matchesTitle && !matchesCategory && !matchesSlug) return false;
        }

        // Status filter
        if (statusFilter !== "ALL" && course.status !== statusFilter) {
          return false;
        }

        // Level filter
        if (levelFilter !== "ALL" && course.level !== levelFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "NEWEST") {
          return new Date(b.createAt).getTime() - new Date(a.createAt).getTime();
        }
        if (sortBy === "OLDEST") {
          return new Date(a.createAt).getTime() - new Date(b.createAt).getTime();
        }
        if (sortBy === "PRICE_HIGH") {
          return (b.price || 0) - (a.price || 0);
        }
        if (sortBy === "PRICE_LOW") {
          return (a.price || 0) - (b.price || 0);
        }
        if (sortBy === "DURATION") {
          return (b.duration || 0) - (a.duration || 0);
        }
        return 0;
      });
  }, [initialCourses, searchQuery, statusFilter, levelFilter, sortBy]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    statusFilter !== "ALL" ||
    levelFilter !== "ALL" ||
    sortBy !== "NEWEST";

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setLevelFilter("ALL");
    setSortBy("NEWEST");
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 1. Status Filter Segmented Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-border/50">
        <button
          type="button"
          onClick={() => setStatusFilter("ALL")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
            statusFilter === "ALL"
              ? "bg-primary text-primary-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          <span>All Courses</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              statusFilter === "ALL"
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {initialCourses.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("PUBLISHED")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
            statusFilter === "PUBLISHED"
              ? "bg-emerald-600 text-white shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          <span>Published</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              statusFilter === "PUBLISHED"
                ? "bg-white/20 text-white"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {publishedCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("DRAFT")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
            statusFilter === "DRAFT"
              ? "bg-amber-600 text-white shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          <span>Drafts</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              statusFilter === "DRAFT"
                ? "bg-white/20 text-white"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
            }`}
          >
            {draftCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("ARCHIVED")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
            statusFilter === "ARCHIVED"
              ? "bg-slate-700 text-white shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          <span>Archived</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              statusFilter === "ARCHIVED"
                ? "bg-white/20 text-white"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {archivedCount}
          </span>
        </button>
      </div>

      {/* 2. Search & Fine-grain Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between p-3 rounded-xl border bg-card/60 backdrop-blur-xs">
        {/* Search input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search courses by title, slug, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/80 h-9 text-xs"
          />
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Level Filter */}
          <div className="flex items-center gap-1.5 bg-background border rounded-lg px-2.5 h-9 text-xs">
            <SlidersHorizontal className="size-3.5 text-muted-foreground" />
            <select
              value={levelFilter}
              aria-label="Level Filter"
              onChange={(e) => setLevelFilter(e.target.value)}
              className="bg-transparent text-xs text-foreground outline-hidden cursor-pointer pr-1"
            >
              <option value="ALL">All Levels</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>

          {/* Sort By Filter */}
          <div className="flex items-center gap-1.5 bg-background border rounded-lg px-2.5 h-9 text-xs">
            <span className="text-muted-foreground text-[11px]">Sort:</span>
            <select
              value={sortBy}
              aria-label="Sort By"
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs text-foreground outline-hidden cursor-pointer pr-1"
            >
              <option value="NEWEST">Newest first</option>
              <option value="OLDEST">Oldest first</option>
              <option value="PRICE_HIGH">Price: High to Low</option>
              <option value="PRICE_LOW">Price: Low to High</option>
              <option value="DURATION">Duration</option>
            </select>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-xs text-muted-foreground hover:text-foreground h-9 px-2.5 gap-1 cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>

      {/* Result counter indicator */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <div>
          Showing <span className="font-semibold text-foreground">{filteredCourses.length}</span>{" "}
          {filteredCourses.length === 1 ? "course" : "courses"}
          {hasActiveFilters && " (filtered)"}
        </div>
      </div>

      {/* Courses Grid or Empty State */}
      {filteredCourses.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-14 text-center border-dashed rounded-2xl bg-card/40">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 shadow-inner">
            <Filter className="size-6" />
          </div>
          <h3 className="text-base font-bold">No courses found</h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mt-1 mb-6 leading-relaxed">
            {hasActiveFilters
              ? "No courses match your active search or filter criteria. Try clearing search terms or reset filters."
              : "No courses have been created yet. Click below to start building your first course."}
          </p>
          {hasActiveFilters ? (
            <Button variant="outline" size="sm" onClick={resetFilters} className="gap-2 cursor-pointer">
              <RotateCcw className="size-3.5" />
              <span>Reset Filters</span>
            </Button>
          ) : (
            <Button asChild size="sm" className="gap-2 shadow-xs">
              <Link href="/admin/courses/create">
                <Plus className="size-4" />
                <span>Create New Course</span>
              </Link>
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const totalLessons = (course.chapters || []).reduce(
              (acc, ch) => acc + (ch.lessons || []).length,
              0,
            );

            return (
              <Card
                key={course.id}
                className="overflow-hidden flex flex-col group border bg-card hover:border-primary/40 hover:shadow-lg transition-all duration-300 rounded-xl"
              >
                {/* Thumbnail Header */}
                <div className="relative aspect-video w-full bg-muted/40 overflow-hidden">
                  <Link href={`/admin/courses/${course.id}`} className="block size-full">
                    {course.fileKey ? (
                      <Image
                        src={course.fileKey}
                        alt={course.title}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-muted-foreground/60">
                        <BookOpen className="size-10 stroke-[1.5]" />
                      </div>
                    )}
                  </Link>

                  {/* Status Badge */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 pointer-events-none">
                    <Badge
                      variant={
                        course.status === "PUBLISHED"
                          ? "default"
                          : course.status === "DRAFT"
                            ? "secondary"
                            : "outline"
                      }
                      className="capitalize text-xs font-semibold backdrop-blur-md shadow-xs"
                    >
                      {course.status.toLowerCase()}
                    </Badge>
                  </div>

                  {/* Category Pill Over Image */}
                  <div className="absolute bottom-2.5 left-2.5 pointer-events-none">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-background/90 text-foreground backdrop-blur-md shadow-xs border border-border/50">
                      {course.category}
                    </span>
                  </div>
                </div>

                {/* Card Info Header */}
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs text-muted-foreground capitalize flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-primary/70 inline-block" />
                      {course.level.toLowerCase()} level
                    </span>

                    <CourseActionsMenu
                      courseId={course.id}
                      courseTitle={course.title}
                    />
                  </div>

                  <CardTitle className="text-base font-bold line-clamp-1 group-hover:text-primary transition-colors">
                    <Link href={`/admin/courses/${course.id}`}>
                      {course.title}
                    </Link>
                  </CardTitle>

                  <CardDescription className="line-clamp-2 text-xs mt-1 leading-relaxed">
                    {course.smallDescription || "No short description provided."}
                  </CardDescription>
                </CardHeader>

                {/* Metadata Content */}
                <CardContent className="p-4 pt-1 flex-1 flex flex-col justify-end gap-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Layers className="size-3.5 text-primary/70" />
                      {(course.chapters || []).length}{" "}
                      {(course.chapters || []).length === 1 ? "Chapter" : "Chapters"} •{" "}
                      {totalLessons} {totalLessons === 1 ? "Lesson" : "Lessons"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5" />
                      {course.duration} hrs
                    </span>
                  </div>
                </CardContent>

                {/* Footer with Price and Actions */}
                <CardFooter className="p-4 pt-2.5 border-t flex items-center justify-between bg-muted/15">
                  <span className="text-sm font-bold text-foreground">
                    {course.price === 0 ? "Free" : `৳ ${course.price.toLocaleString()}`}
                  </span>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="xs" asChild className="gap-1 cursor-pointer">
                      <Link href={`/admin/courses/${course.id}/structure`}>
                        <FolderGit2 className="size-3.5" />
                        <span>Curriculum</span>
                      </Link>
                    </Button>
                    <Button variant="secondary" size="xs" asChild className="gap-1 cursor-pointer">
                      <Link href={`/admin/courses/${course.id}/edit`}>
                        <FileEdit className="size-3.5" />
                        <span>Edit</span>
                      </Link>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
