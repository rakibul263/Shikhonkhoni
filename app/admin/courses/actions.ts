"use server";

import { requireAuth } from "@/lib/auth-guard";
import {
  deleteImageFromCloudinary,
  isCloudinaryConfigured,
  uploadImageToCloudinary,
} from "@/lib/cloudinary";
import { prisma } from "@/lib/db";
import {
  chapterSchema,
  courseSchema,
  lessonSchema,
  type ChapterSchemaType,
  type CourseSchemaType,
  type LessonSchemaType,
  type ReorderListType,
} from "@/lib/zodSchemas";
import { revalidatePath } from "next/cache";

export type MutationResponse<T = unknown> = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: T;
};

// ----------------------------------------------------
// 1. FILE UPLOAD & DELETION
// ----------------------------------------------------
export async function uploadCourseThumbnailAction(formData: FormData) {
  try {
    await requireAuth();

    const file = formData.get("file") as File | null;
    if (!file || !(file instanceof File)) {
      return { success: false, message: "No image file provided." };
    }

    if (!file.type.startsWith("image/")) {
      return {
        success: false,
        message: "Only image files (PNG, JPG, JPEG, WEBP) are allowed.",
      };
    }

    if (file.size > 10 * 1024 * 1024) {
      return { success: false, message: "Image size cannot exceed 10MB." };
    }

    if (!isCloudinaryConfigured()) {
      return {
        success: false,
        isConfigured: false,
        message:
          "Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env",
      };
    }

    const { url, publicId } = await uploadImageToCloudinary(file);
    return {
      success: true,
      url,
      publicId,
      message: "Thumbnail uploaded successfully!",
    };
  } catch (error) {
    console.error("Upload failed:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to upload file.",
    };
  }
}

export async function deleteFileAction(urlOrPublicId: string) {
  try {
    await requireAuth();
    const deleted = await deleteImageFromCloudinary(urlOrPublicId);
    return {
      success: deleted,
      message: deleted ? "File deleted successfully" : "Could not delete file",
    };
  } catch (error) {
    console.error("File deletion error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete file.",
    };
  }
}

// ----------------------------------------------------
// 2. COURSE MUTATIONS (Create, Update, Delete)
// ----------------------------------------------------
export async function createCourseAction(
  data: CourseSchemaType,
): Promise<MutationResponse<{ id: string }>> {
  try {
    const user = await requireAuth();

    const validation = courseSchema.safeParse(data);
    if (!validation.success) {
      return {
        success: false,
        message: "Please fix the validation errors in the form.",
        errors: validation.error.flatten().fieldErrors,
      };
    }

    const validData = validation.data;

    // Check slug uniqueness
    const existing = await prisma.course.findUnique({
      where: { slug: validData.slug },
      select: { id: true },
    });

    if (existing) {
      return {
        success: false,
        message: "A course with this URL slug already exists.",
        errors: {
          slug: ["This URL slug is already taken. Please customize it."],
        },
      };
    }

    const newCourse = await prisma.course.create({
      data: {
        title: validData.title,
        slug: validData.slug,
        smallDescription: validData.smallDescription,
        description: validData.description,
        fileKey: validData.fileKey,
        price: validData.price,
        duration: validData.duration,
        level: validData.level,
        category: validData.category,
        status: validData.status,
        userId: user.id,
      },
    });

    revalidatePath("/admin/courses");
    revalidatePath("/admin");

    return {
      success: true,
      message: "Course created successfully!",
      data: { id: newCourse.id },
    };
  } catch (error) {
    console.error("createCourseAction error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while creating the course.",
    };
  }
}

export async function updateCourseAction(
  courseId: string,
  data: CourseSchemaType,
): Promise<MutationResponse<{ id: string }>> {
  try {
    await requireAuth();

    const validation = courseSchema.safeParse(data);
    if (!validation.success) {
      return {
        success: false,
        message: "Please fix the validation errors in the form.",
        errors: validation.error.flatten().fieldErrors,
      };
    }

    const validData = validation.data;

    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, fileKey: true, slug: true },
    });

    if (!existingCourse) {
      return { success: false, message: "Course not found." };
    }

    // Check slug uniqueness if changed
    if (validData.slug !== existingCourse.slug) {
      const slugConflict = await prisma.course.findUnique({
        where: { slug: validData.slug },
        select: { id: true },
      });
      if (slugConflict) {
        return {
          success: false,
          message: "This slug is already in use by another course.",
          errors: {
            slug: ["Slug is already taken. Please choose another."],
          },
        };
      }
    }

    // If thumbnail was replaced and old one was on Cloudinary, delete old file
    if (
      existingCourse.fileKey &&
      validData.fileKey !== existingCourse.fileKey &&
      existingCourse.fileKey.includes("cloudinary.com")
    ) {
      await deleteImageFromCloudinary(existingCourse.fileKey).catch(console.error);
    }

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        title: validData.title,
        slug: validData.slug,
        smallDescription: validData.smallDescription,
        description: validData.description,
        fileKey: validData.fileKey,
        price: validData.price,
        duration: validData.duration,
        level: validData.level,
        category: validData.category,
        status: validData.status,
      },
    });

    revalidatePath(`/admin/courses/${courseId}`);
    revalidatePath("/admin/courses");
    revalidatePath("/admin");

    return {
      success: true,
      message: "Course updated successfully!",
      data: { id: updatedCourse.id },
    };
  } catch (error) {
    console.error("updateCourseAction error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while updating the course.",
    };
  }
}

export async function deleteCourseAction(
  courseId: string,
): Promise<MutationResponse> {
  try {
    await requireAuth();

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        fileKey: true,
        chapters: {
          select: {
            lessons: {
              select: { fileKey: true },
            },
          },
        },
      },
    });

    if (!course) {
      return { success: false, message: "Course not found." };
    }

    // 1. Delete course thumbnail from Cloudinary
    if (course.fileKey && course.fileKey.includes("cloudinary.com")) {
      await deleteImageFromCloudinary(course.fileKey).catch(console.error);
    }

    // 2. Delete any lesson media files
    for (const chapter of course.chapters) {
      for (const lesson of chapter.lessons) {
        if (lesson.fileKey && lesson.fileKey.includes("cloudinary.com")) {
          await deleteImageFromCloudinary(lesson.fileKey).catch(console.error);
        }
      }
    }

    // 3. Cascade delete course from database
    await prisma.course.delete({
      where: { id: courseId },
    });

    revalidatePath("/admin/courses");
    revalidatePath("/admin");

    return {
      success: true,
      message: "Course and associated files deleted successfully.",
    };
  } catch (error) {
    console.error("deleteCourseAction error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete the course.",
    };
  }
}

// ----------------------------------------------------
// 3. COURSE STRUCTURE: CHAPTERS & DRAG-AND-DROP
// ----------------------------------------------------
export async function createChapterAction(
  data: ChapterSchemaType,
): Promise<MutationResponse<{ id: string }>> {
  try {
    await requireAuth();

    const validation = chapterSchema.safeParse(data);
    if (!validation.success) {
      return {
        success: false,
        message: "Invalid chapter data.",
        errors: validation.error.flatten().fieldErrors,
      };
    }

    // Determine next position
    const lastChapter = await prisma.chapter.findFirst({
      where: { courseId: validation.data.courseId },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const newPosition = lastChapter ? lastChapter.position + 1 : 1;

    const chapter = await prisma.chapter.create({
      data: {
        title: validation.data.title,
        description: validation.data.description,
        courseId: validation.data.courseId,
        position: newPosition,
        isPublished: validation.data.isPublished,
        isFree: validation.data.isFree,
      },
    });

    revalidatePath(`/admin/courses/${validation.data.courseId}`);
    return {
      success: true,
      message: "Chapter created successfully!",
      data: { id: chapter.id },
    };
  } catch (error) {
    console.error("createChapterAction error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create chapter.",
    };
  }
}

export async function updateChapterAction(
  chapterId: string,
  data: Partial<ChapterSchemaType>,
): Promise<MutationResponse> {
  try {
    await requireAuth();

    const updated = await prisma.chapter.update({
      where: { id: chapterId },
      data,
    });

    revalidatePath(`/admin/courses/${updated.courseId}`);
    return {
      success: true,
      message: "Chapter updated successfully!",
    };
  } catch (error) {
    console.error("updateChapterAction error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update chapter.",
    };
  }
}

export async function deleteChapterAction(
  chapterId: string,
): Promise<MutationResponse> {
  try {
    await requireAuth();

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { courseId: true },
    });

    if (!chapter) {
      return { success: false, message: "Chapter not found." };
    }

    await prisma.chapter.delete({
      where: { id: chapterId },
    });

    revalidatePath(`/admin/courses/${chapter.courseId}`);
    return {
      success: true,
      message: "Chapter deleted successfully.",
    };
  } catch (error) {
    console.error("deleteChapterAction error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete chapter.",
    };
  }
}

export async function reorderChaptersAction(
  courseId: string,
  list: ReorderListType,
): Promise<MutationResponse> {
  try {
    await requireAuth();

    await prisma.$transaction(
      list.map((item) =>
        prisma.chapter.update({
          where: { id: item.id },
          data: { position: item.position },
        }),
      ),
    );

    revalidatePath(`/admin/courses/${courseId}`);
    return { success: true, message: "Chapters reordered successfully!" };
  } catch (error) {
    console.error("reorderChaptersAction error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to reorder chapters.",
    };
  }
}

// ----------------------------------------------------
// 4. COURSE STRUCTURE: LESSONS & DRAG-AND-DROP
// ----------------------------------------------------
export async function createLessonAction(
  data: LessonSchemaType,
): Promise<MutationResponse<{ id: string }>> {
  try {
    await requireAuth();

    const validation = lessonSchema.safeParse(data);
    if (!validation.success) {
      return {
        success: false,
        message: "Invalid lesson data.",
        errors: validation.error.flatten().fieldErrors,
      };
    }

    const lastLesson = await prisma.lesson.findFirst({
      where: { chapterId: validation.data.chapterId },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const newPosition = lastLesson ? lastLesson.position + 1 : 1;

    const lesson = await prisma.lesson.create({
      data: {
        title: validation.data.title,
        description: validation.data.description,
        videoUrl: validation.data.videoUrl || null,
        fileKey: validation.data.fileKey || null,
        chapterId: validation.data.chapterId,
        position: newPosition,
        isPublished: validation.data.isPublished,
        isFree: validation.data.isFree,
      },
      include: {
        chapter: { select: { courseId: true } },
      },
    });

    revalidatePath(`/admin/courses/${lesson.chapter.courseId}`);
    return {
      success: true,
      message: "Lesson created successfully!",
      data: { id: lesson.id },
    };
  } catch (error) {
    console.error("createLessonAction error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create lesson.",
    };
  }
}

export async function updateLessonAction(
  lessonId: string,
  data: Partial<LessonSchemaType>,
): Promise<MutationResponse> {
  try {
    await requireAuth();

    const existing = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { fileKey: true, chapter: { select: { courseId: true } } },
    });

    if (!existing) {
      return { success: false, message: "Lesson not found." };
    }

    // Delete old lesson file if replaced
    if (
      existing.fileKey &&
      data.fileKey &&
      data.fileKey !== existing.fileKey &&
      existing.fileKey.includes("cloudinary.com")
    ) {
      await deleteImageFromCloudinary(existing.fileKey).catch(console.error);
    }

    await prisma.lesson.update({
      where: { id: lessonId },
      data,
    });

    revalidatePath(`/admin/courses/${existing.chapter.courseId}`);
    return {
      success: true,
      message: "Lesson updated successfully!",
    };
  } catch (error) {
    console.error("updateLessonAction error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update lesson.",
    };
  }
}

export async function deleteLessonAction(
  lessonId: string,
): Promise<MutationResponse> {
  try {
    await requireAuth();

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: {
        fileKey: true,
        chapter: { select: { courseId: true } },
      },
    });

    if (!lesson) {
      return { success: false, message: "Lesson not found." };
    }

    if (lesson.fileKey && lesson.fileKey.includes("cloudinary.com")) {
      await deleteImageFromCloudinary(lesson.fileKey).catch(console.error);
    }

    await prisma.lesson.delete({
      where: { id: lessonId },
    });

    revalidatePath(`/admin/courses/${lesson.chapter.courseId}`);
    return {
      success: true,
      message: "Lesson deleted successfully.",
    };
  } catch (error) {
    console.error("deleteLessonAction error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete lesson.",
    };
  }
}

export async function reorderLessonsAction(
  chapterId: string,
  list: ReorderListType,
): Promise<MutationResponse> {
  try {
    await requireAuth();

    await prisma.$transaction(
      list.map((item) =>
        prisma.lesson.update({
          where: { id: item.id },
          data: { position: item.position },
        }),
      ),
    );

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { courseId: true },
    });

    if (chapter) {
      revalidatePath(`/admin/courses/${chapter.courseId}`);
    }

    return { success: true, message: "Lessons reordered successfully!" };
  } catch (error) {
    console.error("reorderLessonsAction error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to reorder lessons.",
    };
  }
}

// ----------------------------------------------------
// 5. PROGRESS TRACKING
// ----------------------------------------------------
export async function toggleLessonProgressAction(
  lessonId: string,
  isCompleted: boolean,
): Promise<MutationResponse<{ isCompleted: boolean; progressPercentage: number }>> {
  try {
    const user = await requireAuth();

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: {
        id: true,
        chapter: { select: { courseId: true } },
      },
    });

    if (!lesson) {
      return { success: false, message: "Lesson not found." };
    }

    // Upsert progress
    await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId,
        },
      },
      create: {
        userId: user.id,
        lessonId,
        isCompleted,
      },
      update: {
        isCompleted,
      },
    });

    // Calculate overall course progress
    const courseId = lesson.chapter.courseId;
    const publishedLessons = await prisma.lesson.count({
      where: {
        isPublished: true,
        chapter: { courseId },
      },
    });

    const completedLessons = await prisma.lessonProgress.count({
      where: {
        userId: user.id,
        isCompleted: true,
        lesson: {
          isPublished: true,
          chapter: { courseId },
        },
      },
    });

    const progressPercentage =
      publishedLessons > 0
        ? Math.round((completedLessons / publishedLessons) * 100)
        : 0;

    revalidatePath(`/admin/courses/${courseId}`);
    return {
      success: true,
      message: isCompleted ? "Lesson marked as completed!" : "Lesson marked as incomplete.",
      data: { isCompleted, progressPercentage },
    };
  } catch (error) {
    console.error("toggleLessonProgressAction error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update progress.",
    };
  }
}
