import { z } from "zod";

export const courseLevels = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;
export const courseStatuses = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

export const courseCategories = [
  "Web Development",
  "App Development",
  "Data Science & AI",
  "Design & UI/UX",
  "DevOps & Cloud",
  "Cybersecurity",
  "Database & Backend",
  "Software Engineering",
  "Others",
] as const;

export const courseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Course title must be at least 3 characters")
    .max(120, "Course title cannot exceed 120 characters"),
  slug: z
    .string()
    .trim()
    .min(3, "Slug must be at least 3 characters")
    .max(120, "Slug cannot exceed 120 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can only contain lowercase letters, numbers, and hyphens (e.g., nextjs-complete-guide)",
    ),
  smallDescription: z
    .string()
    .trim()
    .min(10, "Short description must be at least 10 characters")
    .max(250, "Short description cannot exceed 250 characters"),
  description: z
    .string()
    .trim()
    .min(20, "Detailed description must be at least 20 characters"),
  fileKey: z
    .string()
    .trim()
    .min(1, "Thumbnail image URL or file key is required"),
  price: z.coerce
    .number()
    .int("Price must be an integer")
    .min(0, "Price cannot be negative (enter 0 for free course)"),
  duration: z.coerce
    .number()
    .int("Duration must be an integer")
    .min(1, "Duration must be at least 1 hour")
    .max(1000, "Duration cannot exceed 1000 hours"),
  level: z.enum(courseLevels, {
    message: "Please select a valid course level",
  }),
  category: z
    .string()
    .trim()
    .min(2, "Please select or enter a category"),
  status: z.enum(courseStatuses).default("DRAFT"),
});

export type CourseSchemaType = z.infer<typeof courseSchema>;

export const chapterSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Chapter title must be at least 2 characters")
    .max(120, "Chapter title cannot exceed 120 characters"),
  description: z.string().optional(),
  courseId: z.string().min(1, "Course ID is required"),
  isPublished: z.boolean().default(false),
  isFree: z.boolean().default(false),
});

export type ChapterSchemaType = z.infer<typeof chapterSchema>;

export const lessonSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Lesson title must be at least 2 characters")
    .max(120, "Lesson title cannot exceed 120 characters"),
  description: z.string().optional(),
  videoUrl: z.string().url("Please provide a valid video URL").or(z.literal("")).optional(),
  fileKey: z.string().optional(),
  chapterId: z.string().min(1, "Chapter ID is required"),
  isPublished: z.boolean().default(false),
  isFree: z.boolean().default(false),
});

export type LessonSchemaType = z.infer<typeof lessonSchema>;

export const reorderSchema = z.array(
  z.object({
    id: z.string(),
    position: z.number(),
  }),
);

export type ReorderListType = z.infer<typeof reorderSchema>;
