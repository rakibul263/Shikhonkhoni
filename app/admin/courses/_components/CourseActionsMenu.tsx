"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Edit3,
  Eye,
  Layers,
  Loader2,
  MoreVertical,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deleteCourseAction } from "../actions";

interface CourseActionsMenuProps {
  courseId: string;
  courseTitle: string;
}

export function CourseActionsMenu({
  courseId,
  courseTitle,
}: CourseActionsMenuProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await deleteCourseAction(courseId);
      if (!response.success) {
        toast.error(response.message || "Failed to delete course");
        return;
      }

      toast.success("Course and media deleted successfully");
      setIsDeleteDialogOpen(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while deleting the course");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="inline-flex size-8 items-center justify-center rounded-lg border border-transparent hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer outline-none"
        >
          <MoreVertical className="size-4" />
          <span className="sr-only">Open course actions</span>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link
              href={`/admin/courses/${courseId}`}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Eye className="size-4 text-muted-foreground" />
              <span>Course Overview</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href={`/admin/courses/${courseId}/edit`}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Edit3 className="size-4 text-muted-foreground" />
              <span>Edit Details</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href={`/admin/courses/${courseId}/structure`}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Layers className="size-4 text-muted-foreground" />
              <span>Curriculum (Dnd)</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
          >
            <Trash2 className="size-4" />
            <span>Delete Course</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Delete Course</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Are you sure you want to permanently delete &ldquo;{courseTitle}&rdquo;?
              This action cannot be undone and will delete all associated chapters,
              lessons, and Cloudinary media files.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex items-center justify-end gap-2 pt-4">
            <Button
              variant="outline"
              type="button"
              disabled={isDeleting}
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              type="button"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="size-4" />
                  <span>Delete Course</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
