import mongoose, { Schema, models, model } from "mongoose";

export type PaymentReqStatus = "pending" | "approved" | "rejected";

export interface IPaymentRequest {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  bkashNumber: string;
  senderName: string;
  trxId: string;
  amountTaka: number;
  screenshotUrl: string;
  screenshotPublicId?: string;
  status: PaymentReqStatus;
  adminNote?: string;
  createdAt: Date;
}

const PaymentSchema = new Schema<IPaymentRequest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    bkashNumber: { type: String, required: true, trim: true, maxlength: 20 },
    senderName: { type: String, required: true, trim: true, maxlength: 120 },
    trxId: { type: String, required: true, trim: true, maxlength: 80 },
    amountTaka: { type: Number, required: true, min: 1 },
    screenshotUrl: { type: String, required: true },
    screenshotPublicId: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminNote: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

export default models.PaymentRequest ||
  model<IPaymentRequest>("PaymentRequest", PaymentSchema);
