import { v2 as cloudinary } from "cloudinary";

export function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export function getCloudinary() {
  configureCloudinary();
  return cloudinary;
}

/**
 * Signed playback URL. Upload videos as "authenticated" or restricted in Cloudinary
 * for strongest protection; otherwise standard signed URL still hides raw public_id guessing.
 */
export function signedVideoUrl(publicId: string, seconds = 600): string {
  const c = getCloudinary();
  const expiresAt = Math.floor(Date.now() / 1000) + seconds;
  return c.url(publicId, {
    resource_type: "video",
    sign_url: true,
    secure: true,
    expires_at: expiresAt,
  });
}
