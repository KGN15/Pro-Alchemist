import mongoose, { Schema, models, model } from "mongoose";

export interface IVideo {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  /** Cloudinary public_id for authenticated video delivery, or external URL flag */
  cloudinaryPublicId?: string;
  /** Full secure URL if stored as plain URL (signed per-request in API) */
  secureUrl?: string;
  videoId: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
}

const VideoSchema = new Schema<IVideo>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, maxlength: 2000 },
    videoId: { type: String, maxlength: 100 }, 
    cloudinaryPublicId: { type: String, maxlength: 500 },
    secureUrl: { type: String, maxlength: 2000 },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

VideoSchema.index({ sortOrder: 1 });

export default models.Video || model<IVideo>("Video", VideoSchema);
