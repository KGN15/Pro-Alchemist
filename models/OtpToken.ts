import mongoose, { Schema, models, model } from "mongoose";

export type OtpIntent = "login" | "register";

export interface IOtpToken {
  _id: mongoose.Types.ObjectId;
  email: string;
  codeHash: string;
  expiresAt: Date;
  intent: OtpIntent;
  name?: string;
  attempts: number;
  createdAt: Date;
}

const OtpSchema = new Schema<IOtpToken>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    intent: { type: String, enum: ["login", "register"], required: true },
    name: { type: String, trim: true, maxlength: 120 },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

OtpSchema.index({ email: 1 });

export default models.OtpToken || model<IOtpToken>("OtpToken", OtpSchema);
