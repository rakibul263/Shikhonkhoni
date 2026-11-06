import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { EditCourseForm } from "./_components/EditCourseForm";

interface EditCoursePageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const { courseId } = await params;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      title: true,
      slug: true,
      smallDescription: true,
      description: true,
      fileKey: true,
      price: true,
      duration: true,
      level: true,
      category: true,
      status: true,
    },
  });

  if (!course) {
    notFound();
  }

  return (
    <div className="w-full">
      <EditCourseForm course={course} />
    </div>
  );
}
