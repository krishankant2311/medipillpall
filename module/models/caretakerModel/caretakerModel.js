import mongoose from "mongoose";

const caretakerSchema = new mongoose.Schema(
  {
    guardianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guardian",
    },
    patients: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
    }],
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
      otpValue: { type: String, default: null },
      otpExpiry: { type: Date, default: null },
    },
    status: {
      type: String,
      enum: ["Active", "Delete", "Pending", "Blocked"],
      default: "Pending",
    },
      password: {
      type: String,
      default: ""
    },
    profilePhoto: {
      type: String,
      default: ""
    },
    certification:{
      type: String,
      default: ""
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Transgender", "Other"], 
      default: "Male",
    },
    age: { type: Number, default: null },
    // 👇 Token fields
    accessToken: {
      type: String,
      default: "",
    },
    refreshToken: {
      type: String,
      default: "",
    },
    language:{
      type: String,
      default:"English" 
    },
  },
  { timestamps: true }
);

export default mongoose.model("Caretaker", caretakerSchema);
