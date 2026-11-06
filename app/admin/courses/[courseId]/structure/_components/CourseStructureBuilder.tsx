"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  FileEdit,
  FolderGit2,
  GripVertical,
  Plus,
  Trash2,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  createChapterAction,
  createLessonAction,
  deleteChapterAction,
  deleteLessonAction,
  reorderChaptersAction,
  reorderLessonsAction,
  updateChapterAction,
  updateLessonAction,
} from "../../../actions";

interface LessonItem {
  id: string;
  title: string;
  description?: string | null;
  videoUrl?: string | null;
  position: number;
  isPublished: boolean;
  isFree: boolean;
  chapterId: string;
}

interface ChapterItem {
  id: string;
  title: string;
  description?: string | null;
  position: number;
  isPublished: boolean;
  isFree: boolean;
  courseId: string;
  lessons: LessonItem[];
}

interface CourseStructureBuilderProps {
  course: {
    id: string;
    title: string;
    chapters: ChapterItem[];
  };
}

// ----------------------------------------------------
// Sortable Lesson Component
// ----------------------------------------------------
function SortableLesson({
  lesson,
  onRefresh,
}: {
  lesson: LessonItem;
  chapterId?: string;
  onRefresh: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const togglePublished = async () => {
    try {
      const res = await updateLessonAction(lesson.id, {
        isPublished: !lesson.isPublished,
      });
      if (res.success) {
        toast.success(
          lesson.isPublished ? "Lesson unpublished" : "Lesson published!",
        );
        onRefresh();
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const toggleFree = async () => {
    try {
      const res = await updateLessonAction(lesson.id, {
        isFree: !lesson.isFree,
      });
      if (res.success) {
        toast.success(
          lesson.isFree ? "Lesson locked" : "Free preview enabled!",
        );
        onRefresh();
      }
    } catch {
      toast.error("Failed to update preview setting");
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete lesson "${lesson.title}"?`)) return;
    setIsDeleting(true);
    try {
      const res = await deleteLessonAction(lesson.id);
      if (res.success) {
        toast.success("Lesson deleted");
        onRefresh();
      }
    } catch {
      toast.error("Failed to delete lesson");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group/lesson flex items-center justify-between rounded-lg border bg-card p-3 text-sm transition-all ${
        isDragging
          ? "border-primary opacity-60 shadow-lg ring-2 ring-primary/20 z-10"
          : "hover:border-border hover:shadow-xs"
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground/60 hover:text-foreground touch-none p-0.5"
          title="Drag to reorder lesson"
        >
          <GripVertical className="size-4" />
        </button>

        <div className="flex items-center gap-2">
          {lesson.videoUrl ? (
            <Video className="size-4 text-sky-500" />
          ) : (
            <div className="size-2 rounded-full bg-muted-foreground/40" />
          )}
          <span className="font-medium text-foreground">{lesson.title}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge
          variant={lesson.isFree ? "default" : "outline"}
          onClick={toggleFree}
          className="text-[10px] cursor-pointer hover:opacity-85 select-none"
          title="Click to toggle free preview"
        >
          {lesson.isFree ? "Free Preview" : "Locked"}
        </Badge>

        <Badge
          variant={lesson.isPublished ? "default" : "secondary"}
          onClick={togglePublished}
          className="text-[10px] cursor-pointer hover:opacity-85 select-none capitalize"
          title="Click to toggle publication"
        >
          {lesson.isPublished ? "Published" : "Draft"}
        </Badge>

        <Button
          variant="ghost"
          size="icon-xs"
          disabled={isDeleting}
          onClick={handleDelete}
          className="text-muted-foreground hover:text-destructive cursor-pointer"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Sortable Chapter Component
// ----------------------------------------------------
function SortableChapter({
  chapter,
  onRefresh,
  onAddLesson,
}: {
  chapter: ChapterItem;
  onRefresh: () => void;
  onAddLesson: (chapterId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: chapter.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isOpen, setIsOpen] = useState(true);
  const [lessons, setLessons] = useState(chapter.lessons);

  // DnD sensors for lessons within chapter
  const lessonSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleLessonDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = lessons.findIndex((l) => l.id === active.id);
    const newIndex = lessons.findIndex((l) => l.id === over.id);

    const reordered = arrayMove(lessons, oldIndex, newIndex).map((l, index) => ({
      ...l,
      position: index + 1,
    }));

    setLessons(reordered);

    try {
      const payload = reordered.map((l) => ({ id: l.id, position: l.position }));
      await reorderLessonsAction(chapter.id, payload);
      toast.success("Lessons reordered");
    } catch {
      toast.error("Failed to save lesson order");
      onRefresh();
    }
  };

  const togglePublished = async () => {
    try {
      const res = await updateChapterAction(chapter.id, {
        isPublished: !chapter.isPublished,
      });
      if (res.success) {
        toast.success(
          chapter.isPublished ? "Chapter unpublished" : "Chapter published!",
        );
        onRefresh();
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Delete chapter "${chapter.title}" and all its ${chapter.lessons.length} lessons?`,
      )
    )
      return;
    try {
      const res = await deleteChapterAction(chapter.id);
      if (res.success) {
        toast.success("Chapter deleted");
        onRefresh();
      }
    } catch {
      toast.error("Failed to delete chapter");
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`border transition-all ${
        isDragging
          ? "border-primary opacity-60 shadow-xl ring-2 ring-primary/20 z-20"
          : "bg-card shadow-xs"
      }`}
    >
      <CardHeader className="p-4 pb-3 flex flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground/60 hover:text-foreground touch-none p-1 rounded hover:bg-muted"
            title="Drag to reorder chapter"
          >
            <GripVertical className="size-4.5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Chapter {chapter.position}
              </span>
              <Badge
                variant={chapter.isPublished ? "default" : "secondary"}
                onClick={togglePublished}
                className="text-[10px] cursor-pointer hover:opacity-85 select-none"
              >
                {chapter.isPublished ? "Published" : "Draft"}
              </Badge>
            </div>
            <CardTitle className="text-base font-bold mt-0.5">
              {chapter.title}
            </CardTitle>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="xs"
            onClick={() => onAddLesson(chapter.id)}
            className="cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>Add Lesson</span>
          </Button>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleDelete}
            className="text-muted-foreground hover:text-destructive cursor-pointer"
            title="Delete chapter"
          >
            <Trash2 className="size-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setIsOpen((prev) => !prev)}
            className="cursor-pointer"
          >
            {isOpen ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent className="p-4 pt-1 flex flex-col gap-2 border-t bg-muted/5">
          {lessons.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground border border-dashed rounded-lg bg-background/50">
              <p className="text-xs">No lessons added to this chapter yet.</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAddLesson(chapter.id)}
                className="mt-2 text-xs text-primary cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>Create First Lesson</span>
              </Button>
            </div>
          ) : (
            <DndContext
              sensors={lessonSensors}
              collisionDetection={closestCenter}
              onDragEnd={handleLessonDragEnd}
            >
              <SortableContext
                items={lessons.map((l) => l.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-2">
                  {lessons.map((lesson) => (
                    <SortableLesson
                      key={lesson.id}
                      lesson={lesson}
                      chapterId={chapter.id}
                      onRefresh={onRefresh}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// ----------------------------------------------------
// Main Course Structure Builder Page Component
// ----------------------------------------------------
export function CourseStructureBuilder({ course }: CourseStructureBuilderProps) {
  const router = useRouter();
  const [chapters, setChapters] = useState(course.chapters);

  // Modal dialog states
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterDesc, setChapterDesc] = useState("");
  const [isCreatingChapter, setIsCreatingChapter] = useState(false);

  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonVideoUrl, setLessonVideoUrl] = useState("");
  const [lessonIsFree, setLessonIsFree] = useState(false);
  const [isCreatingLesson, setIsCreatingLesson] = useState(false);

  // Chapter DnD sensors
  const chapterSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const refreshData = () => {
    router.refresh();
  };

  const handleChapterDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = chapters.findIndex((c) => c.id === active.id);
    const newIndex = chapters.findIndex((c) => c.id === over.id);

    const reordered = arrayMove(chapters, oldIndex, newIndex).map((ch, index) => ({
      ...ch,
      position: index + 1,
    }));

    setChapters(reordered);

    try {
      const payload = reordered.map((ch) => ({ id: ch.id, position: ch.position }));
      await reorderChaptersAction(course.id, payload);
      toast.success("Chapter order saved!");
    } catch {
      toast.error("Failed to update chapter order");
      refreshData();
    }
  };

  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterTitle.trim()) {
      toast.error("Please enter a chapter title");
      return;
    }

    setIsCreatingChapter(true);
    try {
      const res = await createChapterAction({
        title: chapterTitle.trim(),
        description: chapterDesc.trim() || undefined,
        courseId: course.id,
        isPublished: false,
        isFree: false,
      });

      if (!res.success) {
        toast.error(res.message || "Failed to create chapter");
        return;
      }

      toast.success("Chapter created successfully!");
      setChapterTitle("");
      setChapterDesc("");
      setIsChapterModalOpen(false);
      refreshData();
    } catch {
      toast.error("An error occurred while creating chapter");
    } finally {
      setIsCreatingChapter(false);
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChapterId || !lessonTitle.trim()) {
      toast.error("Please enter a lesson title");
      return;
    }

    setIsCreatingLesson(true);
    try {
      const res = await createLessonAction({
        title: lessonTitle.trim(),
        videoUrl: lessonVideoUrl.trim() || undefined,
        chapterId: selectedChapterId,
        isFree: lessonIsFree,
        isPublished: false,
      });

      if (!res.success) {
        toast.error(res.message || "Failed to create lesson");
        return;
      }

      toast.success("Lesson created successfully!");
      setLessonTitle("");
      setLessonVideoUrl("");
      setLessonIsFree(false);
      setIsLessonModalOpen(false);
      refreshData();
    } catch {
      toast.error("An error occurred while creating lesson");
    } finally {
      setIsCreatingLesson(false);
    }
  };

  const totalLessons = chapters.reduce((acc, ch) => acc + ch.lessons.length, 0);

  return (
    <div className="flex flex-col gap-8 w-full pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="size-9 shrink-0 rounded-lg shadow-2xs hover:bg-muted cursor-pointer"
            asChild
          >
            <Link href="/admin/courses" title="Back to Courses">
              <ArrowLeft className="size-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">Curriculum Structure</h1>
              <Badge variant="outline" className="text-xs">
                {chapters.length} Chapters • {totalLessons} Lessons
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate max-w-lg">
              {course.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/courses/${course.id}/edit`}>
              <FileEdit className="size-4" />
              <span>Edit Details</span>
            </Link>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => setIsChapterModalOpen(true)}
            className="cursor-pointer"
          >
            <Plus className="size-4" />
            <span>Add Chapter</span>
          </Button>
        </div>
      </div>

      {/* Chapters & Lessons Drag and Drop Container */}
      {chapters.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-14 text-center border-dashed">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
            <FolderGit2 className="size-7" />
          </div>
          <h3 className="text-lg font-bold">Curriculum is empty</h3>
          <p className="text-sm text-muted-foreground max-w-md mt-1 mb-6">
            Organize your course by creating chapters, and add lessons within each chapter.
            You can drag and drop to reorder chapters and lessons anytime.
          </p>
          <Button onClick={() => setIsChapterModalOpen(true)}>
            <Plus className="size-4" />
            <span>Create First Chapter</span>
          </Button>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span className="flex items-center gap-1.5">
              <GripVertical className="size-3.5" />
              Drag the grip handles to reorder chapters and lessons
            </span>
            <Button
              variant="outline"
              size="xs"
              onClick={() => setIsChapterModalOpen(true)}
            >
              <Plus className="size-3.5" />
              <span>New Chapter</span>
            </Button>
          </div>

          <DndContext
            sensors={chapterSensors}
            collisionDetection={closestCenter}
            onDragEnd={handleChapterDragEnd}
          >
            <SortableContext
              items={chapters.map((ch) => ch.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-4">
                {chapters.map((chapter) => (
                  <SortableChapter
                    key={chapter.id}
                    chapter={chapter}
                    onRefresh={refreshData}
                    onAddLesson={(chId) => {
                      setSelectedChapterId(chId);
                      setIsLessonModalOpen(true);
                    }}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Add Chapter Dialog */}
      <Dialog open={isChapterModalOpen} onOpenChange={setIsChapterModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateChapter}>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Add New Chapter</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Chapters group related lessons into logical learning modules.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="chTitle" className="text-xs font-semibold">
                  Chapter Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="chTitle"
                  autoFocus
                  placeholder="e.g. Introduction & Fundamentals"
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="chDesc" className="text-xs font-semibold">
                  Chapter Description (Optional)
                </Label>
                <Textarea
                  id="chDesc"
                  rows={3}
                  placeholder="What will students cover in this chapter?"
                  value={chapterDesc}
                  onChange={(e) => setChapterDesc(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsChapterModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreatingChapter}>
                {isCreatingChapter ? "Creating..." : "Save Chapter"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Lesson Dialog */}
      <Dialog open={isLessonModalOpen} onOpenChange={setIsLessonModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateLesson}>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Add New Lesson</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Add an individual lesson or video tutorial to this chapter.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lessTitle" className="text-xs font-semibold">
                  Lesson Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lessTitle"
                  autoFocus
                  placeholder="e.g. 01 - Course Overview & Setup"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lessVideo" className="text-xs font-semibold">
                  Video URL (YouTube, Vimeo, Cloudinary, or HLS)
                </Label>
                <Input
                  id="lessVideo"
                  placeholder="https://..."
                  value={lessonVideoUrl}
                  onChange={(e) => setLessonVideoUrl(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/20">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold">Free Preview</span>
                  <span className="text-[11px] text-muted-foreground">
                    Allow non-enrolled students to watch this lesson for free
                  </span>
                </div>
                <input
                  type="checkbox"
                  id="lessFree"
                  checked={lessonIsFree}
                  onChange={(e) => setLessonIsFree(e.target.checked)}
                  className="size-4 rounded accent-primary cursor-pointer"
                />
              </div>
            </div>

            <DialogFooter className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsLessonModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreatingLesson}>
                {isCreatingLesson ? "Creating..." : "Save Lesson"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
