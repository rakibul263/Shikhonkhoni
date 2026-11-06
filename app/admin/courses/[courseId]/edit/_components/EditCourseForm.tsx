"use client";

import { Editor } from "@/components/rich-text-editor/Editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  courseCategories,
  courseLevels,
  courseSchema,
  courseStatuses,
  type CourseSchemaType,
} from "@/lib/zodSchemas";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  CloudUpload,
  DollarSign,
  GraduationCap,
  Layers,
  Link as LinkIcon,
  Loader2,
  PenLine,
  RefreshCw,
  Sparkles,
  Tag,
  Trash2,
  Upload,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { updateCourseAction, uploadCourseThumbnailAction } from "../../../actions";

interface CourseData {
  id: string;
  title: string;
  slug: string;
  smallDescription: string;
  description: string;
  fileKey: string;
  price: number;
  duration: number;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  category: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}

interface EditCourseFormProps {
  course: CourseData;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function EditCourseForm({ course }: EditCourseFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPredefinedCategory = (courseCategories as readonly string[]).includes(
    course.category,
  );

  const [formData, setFormData] = useState<CourseSchemaType>({
    title: course.title,
    slug: course.slug,
    smallDescription: course.smallDescription,
    description: course.description,
    fileKey: course.fileKey,
    price: course.price,
    duration: course.duration,
    level: course.level,
    category: course.category,
    status: course.status,
  });

  const [selectedCategory, setSelectedCategory] = useState<string>(
    isPredefinedCategory ? course.category : "Others",
  );
  const [customCategory, setCustomCategory] = useState<string>(
    isPredefinedCategory ? "" : course.category,
  );

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showManualUrlInput, setShowManualUrlInput] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      title: e.target.value,
    }));
    if (errors.title) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.title;
        return next;
      });
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      slug: slugify(e.target.value),
    }));
    if (errors.slug) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.slug;
        return next;
      });
    }
  };

  const handleRegenerateSlug = () => {
    const newSlug = slugify(formData.title);
    setFormData((prev) => ({ ...prev, slug: newSlug }));
    toast.info("Slug regenerated from course title");
  };

  const handleFieldChange = (
    field: keyof CourseSchemaType,
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleCategorySelect = (value: string) => {
    setSelectedCategory(value);
    if (errors.category) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.category;
        return next;
      });
    }

    if (value === "Others") {
      setFormData((prev) => ({
        ...prev,
        category: customCategory.trim() || "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        category: value,
      }));
    }
  };

  const handleCustomCategoryChange = (value: string) => {
    setCustomCategory(value);
    setFormData((prev) => ({
      ...prev,
      category: value,
    }));
    if (errors.category) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.category;
        return next;
      });
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WEBP, etc.)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit.");
      return;
    }

    setIsUploadingImage(true);
    setImgError(false);

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const result = await uploadCourseThumbnailAction(uploadData);

      if (!result.success) {
        toast.error(result.message || "Failed to upload to Cloudinary");
        if (result.isConfigured === false) {
          setShowManualUrlInput(true);
        }
        return;
      }

      if (result.url) {
        setFormData((prev) => ({
          ...prev,
          fileKey: result.url!,
        }));
        if (errors.fileKey) {
          setErrors((prev) => {
            const next = { ...prev };
            delete next.fileKey;
            return next;
          });
        }
        toast.success("New thumbnail uploaded to Cloudinary!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image.");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (selectedCategory === "Others" && !customCategory.trim()) {
      setErrors((prev) => ({
        ...prev,
        category: ["Please specify the custom category name"],
      }));
      toast.error("Please enter a custom category name.");
      return;
    }

    const validation = courseSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      setErrors(fieldErrors);
      const firstErrorMessage =
        Object.values(fieldErrors)[0]?.[0] || "Please check the form for errors.";
      toast.error(firstErrorMessage);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await updateCourseAction(course.id, validation.data);

      if (!response.success) {
        if (response.errors) {
          setErrors(response.errors);
        }
        toast.error(response.message || "Failed to update course");
        return;
      }

      toast.success("Course updated successfully!");
      router.push("/admin/courses");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred while updating the course.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 pb-16 w-full">
      {/* Top action header */}
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
              <span className="sr-only">Back to Courses</span>
            </Link>
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">Edit Course</h1>
              <Badge variant="outline" className="text-xs capitalize">
                {formData.status.toLowerCase()}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Modify course details, update curriculum, or change pricing
            </p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/courses/${course.id}/structure`}>
              <Layers className="size-4" />
              <span>Curriculum Structure</span>
            </Link>
          </Button>

          <Button
            variant="outline"
            type="button"
            disabled={isSubmitting}
            asChild
          >
            <Link href="/admin/courses">Cancel</Link>
          </Button>

          <Button type="submit" disabled={isSubmitting} className="min-w-32">
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <Check className="size-4" />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                Course Details
              </CardTitle>
              <CardDescription>
                Title, public URL slug, and descriptions for students.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {/* Title */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="title" className="font-medium">
                    Course Title <span className="text-destructive">*</span>
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {formData.title.length}/120
                  </span>
                </div>
                <Input
                  id="title"
                  placeholder="e.g. Complete Full Stack Next.js & React Guide"
                  value={formData.title}
                  onChange={handleTitleChange}
                  aria-invalid={!!errors.title}
                  className={errors.title ? "border-destructive focus-visible:ring-destructive/20" : ""}
                />
                {errors.title && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-0.5">
                    <AlertCircle className="size-3" />
                    {errors.title[0]}
                  </p>
                )}
              </div>

              {/* Slug */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="slug" className="font-medium flex items-center gap-1.5">
                    <LinkIcon className="size-3.5 text-muted-foreground" />
                    Course Slug (URL identifier) <span className="text-destructive">*</span>
                  </Label>
                  {formData.title && (
                    <button
                      type="button"
                      onClick={handleRegenerateSlug}
                      className="text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="size-3" />
                      Auto-generate
                    </button>
                  )}
                </div>
                <Input
                  id="slug"
                  placeholder="e.g. nextjs-masterclass"
                  value={formData.slug}
                  onChange={handleSlugChange}
                  aria-invalid={!!errors.slug}
                  className={errors.slug ? "border-destructive focus-visible:ring-destructive/20 font-mono text-sm" : "font-mono text-sm"}
                />
                {errors.slug && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-0.5">
                    <AlertCircle className="size-3" />
                    {errors.slug[0]}
                  </p>
                )}
              </div>

              {/* Small Description */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="smallDescription" className="font-medium">
                    Short Summary (Brief Description) <span className="text-destructive">*</span>
                  </Label>
                  <span
                    className={`text-xs ${
                      formData.smallDescription.length > 250
                        ? "text-destructive font-semibold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {formData.smallDescription.length}/250
                  </span>
                </div>
                <Textarea
                  id="smallDescription"
                  rows={2}
                  placeholder="A concise, compelling 1-2 sentence hook explaining what students will achieve."
                  value={formData.smallDescription}
                  onChange={(e) =>
                    handleFieldChange("smallDescription", e.target.value)
                  }
                  aria-invalid={!!errors.smallDescription}
                  className={errors.smallDescription ? "border-destructive focus-visible:ring-destructive/20" : ""}
                />
                {errors.smallDescription && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-0.5">
                    <AlertCircle className="size-3" />
                    {errors.smallDescription[0]}
                  </p>
                )}
              </div>

              {/* TipTap Rich Text Editor for Detailed Description */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="description" className="font-medium">
                  Full Course Description & Curriculum Overview{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Editor
                  value={formData.description}
                  onChange={(val) => handleFieldChange("description", val)}
                  placeholder="Provide an in-depth breakdown of the course topics, prerequisites, key learning outcomes..."
                  className={errors.description ? "border-destructive focus-within:ring-destructive/20" : ""}
                />
                {errors.description && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-0.5">
                    <AlertCircle className="size-3" />
                    {errors.description[0]}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Cloudinary Thumbnail */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <CloudUpload className="size-4 text-primary" />
                Course Thumbnail (Cloudinary Upload)
              </CardTitle>
              <CardDescription>
                Replace or update the thumbnail image hosted on Cloudinary.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
              />

              {!formData.fileKey ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  onClick={() => !isUploadingImage && fileInputRef.current?.click()}
                  className={`group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
                    isDragOver
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 hover:bg-muted/40"
                  } ${isUploadingImage ? "pointer-events-none opacity-80" : ""}`}
                >
                  {isUploadingImage ? (
                    <div className="flex flex-col items-center gap-3 py-4">
                      <Loader2 className="size-9 animate-spin text-primary" />
                      <p className="text-sm font-semibold">Uploading to Cloudinary...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex size-13 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <CloudUpload className="size-6" />
                      </div>
                      <p className="text-sm font-semibold">Click to upload new thumbnail</p>
                      <Button type="button" size="sm" variant="secondary">
                        <Upload className="size-3.5" />
                        Choose Photo
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-muted/20 shadow-xs group">
                    <Image
                      src={formData.fileKey}
                      alt="Course thumbnail"
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-300 group-hover:scale-102"
                      onError={() => setImgError(true)}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="size-3.5" />
                        Change Photo
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => setFormData((p) => ({ ...p, fileKey: "" }))}
                      >
                        <Trash2 className="size-3.5" />
                        Remove
                      </Button>
                    </div>
                    <div className="absolute top-2.5 left-2.5">
                      <Badge variant="default" className="text-xs flex items-center gap-1 bg-emerald-600/90 text-white">
                        <CheckCircle2 className="size-3" />
                        Cloudinary Hosted
                      </Badge>
                    </div>
                  </div>

                  {imgError && (
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <AlertCircle className="size-3" />
                      Image preview failed to load from this URL.
                    </p>
                  )}
                </div>
              )}

              {/* Manual URL input toggle */}
              <div className="pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowManualUrlInput((p) => !p)}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                >
                  <PenLine className="size-3" />
                  {showManualUrlInput ? "Hide manual URL input" : "Or enter image URL directly"}
                </button>
                {showManualUrlInput && (
                  <div className="mt-2">
                    <Input
                      placeholder="https://..."
                      value={formData.fileKey}
                      onChange={(e) => handleFieldChange("fileKey", e.target.value)}
                      className="text-xs font-mono"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 Col) */}
        <div className="flex flex-col gap-6">
          {/* Publication Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary" />
                Publication Status
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-2">
                {courseStatuses.map((st) => {
                  const isSelected = formData.status === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleFieldChange("status", st)}
                      className={`flex flex-col items-center justify-center rounded-lg border p-2.5 text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20"
                          : "border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="capitalize">{st.toLowerCase()}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Category & Level */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Layers className="size-4 text-primary" />
                Category & Difficulty
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex flex-col gap-2.5">
                <Label htmlFor="categorySelect" className="font-medium flex items-center gap-1.5">
                  <Tag className="size-3.5 text-muted-foreground" />
                  Course Category <span className="text-destructive">*</span>
                </Label>
                <select
                  id="categorySelect"
                  className="h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1.5 text-sm transition-colors outline-none focus:ring-2 focus:ring-ring focus:border-ring dark:bg-input/30 cursor-pointer"
                  value={selectedCategory}
                  onChange={(e) => handleCategorySelect(e.target.value)}
                >
                  {courseCategories.map((cat) => (
                    <option key={cat} value={cat} className="bg-popover text-popover-foreground">
                      {cat}
                    </option>
                  ))}
                </select>

                {selectedCategory === "Others" && (
                  <div className="flex flex-col gap-1.5 pt-1 animate-in fade-in-50 duration-200">
                    <Label htmlFor="customCat" className="text-xs font-semibold">
                      Specify Custom Category <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="customCat"
                      placeholder="e.g. AI & Robotics..."
                      value={customCategory}
                      onChange={(e) => handleCustomCategoryChange(e.target.value)}
                      aria-invalid={!!errors.category}
                      className={errors.category ? "border-destructive focus-visible:ring-destructive/20" : ""}
                    />
                  </div>
                )}
                {errors.category && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    {errors.category[0]}
                  </p>
                )}
              </div>

              {/* Difficulty Level */}
              <div className="flex flex-col gap-2">
                <Label className="font-medium flex items-center gap-1.5">
                  <GraduationCap className="size-3.5 text-muted-foreground" />
                  Skill Level <span className="text-destructive">*</span>
                </Label>
                <div className="flex flex-col gap-2">
                  {courseLevels.map((lvl) => {
                    const isSelected = formData.level === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => handleFieldChange("level", lvl)}
                        className={`flex items-center justify-between rounded-lg border p-3 text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20"
                            : "border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span className="text-xs font-semibold capitalize">
                          {lvl.toLowerCase()}
                        </span>
                        {isSelected && (
                          <Badge variant="default" className="text-[10px]">
                            Selected
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Duration */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <DollarSign className="size-4 text-primary" />
                Pricing & Duration
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="price" className="font-medium">
                  Course Price (BDT) <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-semibold">
                    ৳
                  </span>
                  <Input
                    id="price"
                    type="number"
                    min={0}
                    step={1}
                    className="pl-8"
                    value={formData.price}
                    onChange={(e) => handleFieldChange("price", Number(e.target.value))}
                    aria-invalid={!!errors.price}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="duration" className="font-medium flex items-center gap-1.5">
                  <Clock className="size-3.5 text-muted-foreground" />
                  Total Duration (Hours) <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="duration"
                    type="number"
                    min={1}
                    max={1000}
                    className="pr-16"
                    value={formData.duration}
                    onChange={(e) => handleFieldChange("duration", Number(e.target.value))}
                    aria-invalid={!!errors.duration}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium pointer-events-none">
                    Hours
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile & Tablet Action Buttons */}
      <div className="flex lg:hidden flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-6 border-t">
        <Button
          variant="outline"
          type="button"
          disabled={isSubmitting}
          className="w-full sm:w-auto"
          asChild
        >
          <Link href="/admin/courses">Cancel</Link>
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto min-w-32"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Updating...</span>
            </>
          ) : (
            <>
              <Check className="size-4" />
              <span>Save Changes</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
