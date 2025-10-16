import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    guardianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guardian",
    },
    caretakerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Caretaker",
      default: null
    },
    fullName: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      default: "",
    },
    mobileNumber: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      default: ""
    },
    language: {
      type: String,
      enum: ["English", "Hindi"],
      default: "English"
    },
    otp: {
      otpValue: {
        type: String,
        default: "",
      },
      otpExpiry: {
        type: String,
        default: "",
      },
    },
    // 👇 Token fields
    accessToken: {
      type: String,
      default: "",
    },
    profilePhoto: {
      type: String,
      default: ""
    },
    relation: {
      type: String,
      default: ""
    },
    refreshToken: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Active", "Pending", "Delete"],
      default: "Pending",
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Transgender", "Other"],
      default: "Male",
    },
    filePath: {
      type: String,
      default: ""
    },
    diseaseCondition: {
      type: String,
      default: ""
    },
  },
  { timestamps: true }
);

export const Patient = mongoose.model("Patient", patientSchema);
export default Patient;
