import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { CourseStructureBuilder } from "./_components/CourseStructureBuilder";

interface CourseStructurePageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function CourseStructurePage({
  params,
}: CourseStructurePageProps) {
  const { courseId } = await params;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      title: true,
      chapters: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          title: true,
          description: true,
          position: true,
          isPublished: true,
          isFree: true,
          courseId: true,
          lessons: {
            orderBy: { position: "asc" },
            select: {
              id: true,
              title: true,
              description: true,
              videoUrl: true,
              position: true,
              isPublished: true,
              isFree: true,
              chapterId: true,
            },
          },
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 max-w-5xl">
      <CourseStructureBuilder course={course} />
    </div>
  );
}
