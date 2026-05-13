import mongoose, { Schema, models, model } from "mongoose";

export type PaymentStatus = "none" | "pending" | "approved" | "rejected";

export interface IUser {
  _id: mongoose.Types.ObjectId;
  email: string;
  name: string;
  paymentStatus: PaymentStatus;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    paymentStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 });

export default models.User || model<IUser>("User", UserSchema);
