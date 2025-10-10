import mongoose from "mongoose";

const guardianSchema = new mongoose.Schema(
  {
    // guardianModel.js
    patients: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient"
    }],

    fullName: {
      type: String,
      default: "",
    },
    mobileNumber: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      unique: true,
      default: "",
    },
    otp: {
      otpValue: { type: String, default: "" },
      otpExpiry: { type: Date, default: "" },
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
