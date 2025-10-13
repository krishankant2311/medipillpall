import mongoose from "mongoose";

const guardianSchema = new mongoose.Schema(
  {
    patients: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient"
    }],

    fullName: { 
      type: String, 
      default: "" 
    },

    mobileNumber: { 
      type: String,    // Allows multiple null/undefined
      default: "" 
    },

    email: { 
      type: String,      // Allows multiple null/undefined
      default: "" 
    },

    otp: {
      otpValue: { type: String, default: "" },
      otpExpiry: { type: Date, default: null },
    },

    status: {
      type: String,
      enum: ["Active", "Delete", "Pending", "Blocked"],
      default: "Pending",
    },

    accessToken: { type: String, default: "" },
    refreshToken: { type: String, default: "" },
  },
  { timestamps: true }
);

// ✅ Prevent OverwriteModelError
const Guardian = mongoose.models.Guardian || mongoose.model("Guardian", guardianSchema);
export default Guardian;
