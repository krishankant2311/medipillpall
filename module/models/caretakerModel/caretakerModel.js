import mongoose from "mongoose";

const caretakerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true,
      default: "",
    },
    mobileNumber: {
      type: String,
      trim: true,
      unique: true,
      default: "",
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      default: "",
    },
    otp: {
      value: { type: String, default: null },
      expiresAt: { type: Date, default: null },
    },
    status: {
      type: String,
      enum: ["Active", "Delete", "Pending", "Blocked"],
      default: "Pending",
    },
    accessToken: {
      type: String,
      default: "",
    },
    refreshToken: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Caretaker", caretakerSchema);
