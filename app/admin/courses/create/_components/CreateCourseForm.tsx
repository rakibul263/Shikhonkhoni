"use client";

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
import { Editor } from "@/components/rich-text-editor/Editor";
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
import { createCourseAction, uploadCourseThumbnailAction } from "../actions";

const SAMPLE_THUMBNAILS = [
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CreateCourseForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<CourseSchemaType>({
    title: "",
    slug: "",
    smallDescription: "",
    description: "",
    fileKey: "",
    price: 0,
    duration: 1,
    level: "BEGINNER",
    category: "Web Development",
    status: "DRAFT",
  });

  // Category "Others" handling
  const [selectedCategory, setSelectedCategory] = useState<string>("Web Development");
  const [customCategory, setCustomCategory] = useState<string>("");

  // Upload state
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showManualUrlInput, setShowManualUrlInput] = useState(false);

  // Form states
  const [isSlugTouched, setIsSlugTouched] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Title change with auto-slug
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: !isSlugTouched ? slugify(val) : prev.slug,
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
    setIsSlugTouched(true);
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
    setIsSlugTouched(false);
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

  // Category change handler
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

  // Cloudinary image upload handler
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
        toast.success("Photo uploaded to Cloudinary successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image. Please check your network or try again.");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleImageUpload(files[0]);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, fileKey: "" }));
    setImgError(false);
    toast.info("Course thumbnail removed");
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // If "Others" is selected and no custom category name is typed
    if (selectedCategory === "Others" && !customCategory.trim()) {
      setErrors((prev) => ({
        ...prev,
        category: ["Please specify the custom category name"],
      }));
      toast.error("Please enter a custom category name.");
      return;
    }

    // Client-side Zod validation
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
      const response = await createCourseAction(validation.data);

      if (!response.success) {
        if (response.errors) {
          setErrors(response.errors);
        }
        toast.error(response.message || "Failed to create course");
        return;
      }

      toast.success(response.message || "Course created successfully!");
      router.push("/admin/courses");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred while creating the course.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 pb-16">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        {/* Left side: Back Button and Title */}
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
            <h1 className="text-2xl font-bold tracking-tight">Create Course</h1>
            <p className="text-sm text-muted-foreground">
              Configure course details, pricing, media, and syllabus
            </p>
          </div>
        </div>

        {/* Right side: Cancel and Save Action Buttons (Desktop only) */}
        <div className="hidden lg:flex items-center gap-3">
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
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Check className="size-4" />
                <span>Save Course</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols) - Core Course Info & Cloudinary Media */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Card 1: Primary Information */}
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

              {/* Slug with URL preview */}
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
                <p className="text-xs text-muted-foreground">
                  The unique web address for this course. Use lowercase letters and hyphens.
                </p>
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

              {/* Detailed Description with TipTap Rich Text Editor */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="description" className="font-medium">
                  Full Course Description & Curriculum Overview{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Editor
                  value={formData.description}
                  onChange={(val) => handleFieldChange("description", val)}
                  placeholder="Provide an in-depth breakdown of the course topics, prerequisites, key learning outcomes, and practical projects students will build..."
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

          {/* Card 2: Cloudinary Photo Upload & Media */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <CloudUpload className="size-4 text-primary" />
                Course Thumbnail (Cloudinary Upload)
              </CardTitle>
              <CardDescription>
                Upload an eye-catching thumbnail to Cloudinary or specify an image URL.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {/* Hidden File Input */}
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

              {/* Upload Dropzone / Preview */}
              {!formData.fileKey ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleFileDrop}
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
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm font-semibold">Uploading to Cloudinary...</p>
                        <p className="text-xs text-muted-foreground">
                          Compressing and generating secure CDN URL
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex size-13 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-105">
                        <CloudUpload className="size-6" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-semibold">
                          Click to upload or drag & drop thumbnail
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Supports PNG, JPG, JPEG, WEBP (Max 10MB) • Uploads to Cloudinary
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="mt-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                      >
                        <Upload className="size-3.5" />
                        Choose Photo
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                /* Uploaded Thumbnail Preview with Actions */
                <div className="flex flex-col gap-3">
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-muted/20 shadow-xs group">
                    <Image
                      src={formData.fileKey}
                      alt="Uploaded course thumbnail"
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
                        onClick={handleRemoveImage}
                      >
                        <Trash2 className="size-3.5" />
                        Remove
                      </Button>
                    </div>
                    <div className="absolute top-2.5 left-2.5">
                      <Badge variant="default" className="text-xs flex items-center gap-1 bg-emerald-600/90 text-white">
                        <CheckCircle2 className="size-3" />
                        Cloudinary Ready
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                    <span className="truncate max-w-[70%] font-mono">
                      {formData.fileKey}
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-destructive hover:underline cursor-pointer flex items-center gap-1 font-medium"
                    >
                      <Trash2 className="size-3" />
                      Remove
                    </button>
                  </div>

                  {imgError && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 px-1">
                      <AlertCircle className="size-3" />
                      Image preview could not be loaded. Please ensure the URL is publicly accessible.
                    </p>
                  )}
                </div>
              )}

              {/* Error on fileKey */}
              {errors.fileKey && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  {errors.fileKey[0]}
                </p>
              )}

              {/* Secondary Options: Preset image or manual URL input */}
              <div className="flex flex-col gap-3 pt-2 border-t">
                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => setShowManualUrlInput((prev) => !prev)}
                    className="text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                  >
                    <PenLine className="size-3" />
                    {showManualUrlInput ? "Hide manual URL input" : "Or enter image URL directly"}
                  </button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => {
                      const randomSample =
                        SAMPLE_THUMBNAILS[
                          Math.floor(Math.random() * SAMPLE_THUMBNAILS.length)
                        ];
                      setImgError(false);
                      handleFieldChange("fileKey", randomSample);
                      toast.success("Sample thumbnail applied!");
                    }}
                  >
                    Use Sample Preset
                  </Button>
                </div>

                {showManualUrlInput && (
                  <div className="flex flex-col gap-1.5 animate-in fade-in-50 duration-200">
                    <Label htmlFor="manualFileKey" className="text-xs">
                      Direct Image URL
                    </Label>
                    <Input
                      id="manualFileKey"
                      placeholder="https://..."
                      value={formData.fileKey}
                      onChange={(e) => {
                        setImgError(false);
                        handleFieldChange("fileKey", e.target.value);
                      }}
                      className="text-xs font-mono"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 Col) - Metadata, Category (with Others), Pricing */}
        <div className="flex flex-col gap-6">
          {/* Card 3: Publishing Status */}
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
              <p className="text-xs text-muted-foreground">
                {formData.status === "DRAFT" &&
                  "Draft courses are private and only visible to administrators."}
                {formData.status === "PUBLISHED" &&
                  "Published courses will appear immediately in the course catalog."}
                {formData.status === "ARCHIVED" &&
                  "Archived courses are retired and hidden from new enrollments."}
              </p>
            </CardContent>
          </Card>

          {/* Card 4: Category & Difficulty (with "Others" Custom Input) */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Layers className="size-4 text-primary" />
                Category & Difficulty
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {/* Category Select + "Others" Custom Input */}
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
                    <option
                      key={cat}
                      value={cat}
                      className="bg-popover text-popover-foreground"
                    >
                      {cat}
                    </option>
                  ))}
                </select>

                {/* When "Others" is selected, dynamically show custom category input */}
                {selectedCategory === "Others" && (
                  <div className="flex flex-col gap-1.5 pt-1 animate-in fade-in-50 slide-in-from-top-1 duration-200">
                    <Label htmlFor="customCategoryInput" className="text-xs font-semibold text-foreground flex items-center gap-1">
                      <PenLine className="size-3 text-primary" />
                      Specify Custom Category <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="customCategoryInput"
                      autoFocus
                      placeholder="e.g. Artificial Intelligence, Game Dev, Robotics..."
                      value={customCategory}
                      onChange={(e) => handleCustomCategoryChange(e.target.value)}
                      aria-invalid={!!errors.category}
                      className={errors.category ? "border-destructive focus-visible:ring-destructive/20" : ""}
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Type the custom category name for this course.
                    </p>
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
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-semibold capitalize">
                            {lvl.toLowerCase()}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {lvl === "BEGINNER" && "No prior knowledge required"}
                            {lvl === "INTERMEDIATE" && "Some foundational experience"}
                            {lvl === "ADVANCED" && "For experienced professionals"}
                          </span>
                        </div>
                        {isSelected && (
                          <Badge variant="default" className="text-[10px]">
                            Selected
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
                {errors.level && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    {errors.level[0]}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Card 5: Pricing & Timing */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <DollarSign className="size-4 text-primary" />
                Pricing & Duration
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {/* Price */}
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
                    placeholder="0"
                    value={formData.price}
                    onChange={(e) =>
                      handleFieldChange("price", Number(e.target.value))
                    }
                    aria-invalid={!!errors.price}
                  />
                </div>
                {errors.price && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    {errors.price[0]}
                  </p>
                )}
                <span className="text-xs text-muted-foreground">
                  Set to 0 if this course is completely free.
                </span>
              </div>

              {/* Duration */}
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
                    placeholder="e.g. 25"
                    value={formData.duration}
                    onChange={(e) =>
                      handleFieldChange("duration", Number(e.target.value))
                    }
                    aria-invalid={!!errors.duration}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium pointer-events-none">
                    Hours
                  </span>
                </div>
                {errors.duration && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    {errors.duration[0]}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile & Tablet Action Buttons (visible on mobile and tablet, hidden on desktop) */}
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
              <span>Creating...</span>
            </>
          ) : (
            <>
              <Check className="size-4" />
              <span>Save Course</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
