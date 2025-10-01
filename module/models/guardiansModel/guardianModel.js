import mongoose from "mongoose";

const guardianSchema = new mongoose.Schema(
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
      value: { type: String, default: "" },
      expiresAt: { type: Date, default: "" },
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
const Guardian = mongoose.model("Guardian", guardianSchema);
export default Guardian;
