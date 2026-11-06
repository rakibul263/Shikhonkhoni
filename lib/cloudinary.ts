import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

// Initialize Cloudinary config
cloudinary.config({
  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export function isCloudinaryConfigured(): boolean {
  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  return Boolean((cloudName && apiKey && apiSecret) || process.env.CLOUDINARY_URL);
}

export async function uploadImageToCloudinary(
  file: File,
  folder = "shikhonkhoni/courses",
): Promise<{ url: string; publicId: string }> {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary credentials missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.",
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64Data = `data:${file.type};base64,${buffer.toString("base64")}`;

  const result: UploadApiResponse = await cloudinary.uploader.upload(
    base64Data,
    {
      folder,
      resource_type: "image",
    },
  );

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

export function extractPublicId(urlOrPublicId: string): string | null {
  if (!urlOrPublicId) return null;
  if (!urlOrPublicId.startsWith("http://") && !urlOrPublicId.startsWith("https://")) {
    return urlOrPublicId;
  }
  // Matches /upload/(optional version)/<public_id>.<ext>
  const matches = urlOrPublicId.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
  if (matches && matches[1]) {
    return matches[1];
  }
  return null;
}

export async function deleteImageFromCloudinary(
  urlOrPublicId: string,
): Promise<boolean> {
  if (!isCloudinaryConfigured()) return false;
  const publicId = extractPublicId(urlOrPublicId);
  if (!publicId) return false;

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok";
  } catch (error) {
    console.error("Cloudinary file deletion error:", error);
    return false;
  }
}

export { cloudinary };
